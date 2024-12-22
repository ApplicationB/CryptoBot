// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import './chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol';
import './uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import './uniswap/v3-periphery/contracts/interfaces/IUniswapV3Pool.sol';
import './uniswap/v3-periphery/contracts/interfaces/IPeripheryImmutableState.sol';
import './uniswap/v3-periphery/contracts/interfaces/IPeripheryPayments.sol';
import './uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol';
import './aave/protocol-v2/contracts/interfaces/ILendingPool.sol';
import './aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol';
 


interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract MainBot {
    address public owner; 
    bool public tradingEnabled;
    uint256 public initialDeposit;
    uint256 public maticBalance;
    uint256 public stablecoinBalance;
    uint256 public profitThreshold;
    uint256 public lossThreshold;
    uint256 public gasCostMultiplier = 3;
    uint256 public trailingStopLoss = 10;
    uint256 public nextLogTime;
    string public currentActivity = "Initializing";

    address public POLToken = 0x22B21BedDef74FE62F031D2c5c8F7a9F8a4b304D; // POL on Polygon  [SWAP TOKEN HERE]
    address public usdtToken = 0x1E4a5963aBFD975d8c9021ce480b42188849D41d; // USDT on Polygon
    address public usdcToken = 0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035; // USDC on Polygon
    address public quickSwapRouter = 0x1E7E4c855520b2106320952A570a3e5E3E618101; // QuickSwap Router
    address public priceFeedAddress = 0x5E988c11a4f92155C30D9fb69Ed75597f712B113; // Chainlink MATIC/USD

    address public uniswapRouter = 0x1E7E4c855520b2106320952A570a3e5E3E618101; // Uniswap V3 SwapRouter
    address public uniswapPositionManager = 0xC36442b4a4522E871399CD717aBDD847Ab11FE88; // Uniswap V3 PositionManager
    address public aaveLendingPoolAddressesProvider = 0xd05e3E715d945B59290df0ae8eF85c1BdB684744; // AAVE LendingPoolAddressesProvider

    mapping(string => address) public dexRouters;

    event TradeExecuted(address indexed user, string tradeType, uint amountIn, uint amountOut, uint price);
    event StopLossTriggered(uint currentBalance, uint threshold);
    event CurrentActivity(string activity);
    event TestEvent(string message);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier whenTradingEnabled() {
        require(tradingEnabled, "Trading is disabled");
        _;
    }

    constructor() {
        owner = msg.sender;
        dexRouters["QuickSwap"] = quickSwapRouter;
        tradingEnabled = false;
        profitThreshold = 110; // 10% profit
        lossThreshold = 85; // 85% of initial deposit
        nextLogTime = block.timestamp;
    }

    function setController(address controller) external onlyOwner {
        owner = controller;
    }

    receive() external payable {
        initialDeposit += msg.value;
        maticBalance += (msg.value * 70) / 100;
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

    // Calculate expected output (simplified example, adjust based on your pool and requirements)
    uint256 amountOut = calculateAmountOut(amountIn, sqrtPriceX96, liquidity);

    uint256 slippage = (amountOut * 1) / 100;
    sufficientLiquidity = (amountOut >= amountIn - slippage);
}

function calculateAmountOut(uint256 amountIn, uint160 sqrtPriceX96, uint256 liquidity) internal pure returns (uint256) {
    // Example calculation, adjust as needed for your logic
    return uint256(amountIn * sqrtPriceX96 / liquidity);
}


    function disableTrading() external onlyOwner {
        tradingEnabled = false;
    }

    function withdrawInGwei(uint256 amountInGwei) external onlyOwner {
        uint256 amountInWei = amountInGwei * 1 gwei;
        require(address(this).balance >= amountInWei, "Insufficient balance");
        payable(owner).transfer(amountInWei);
    }

function kill() external onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
}

    function logCurrentActivity() internal whenTradingEnabled {
        if (block.timestamp >= nextLogTime) {
            emit CurrentActivity(currentActivity);
            nextLogTime = block.timestamp + 60; // 60 seconds interval
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
        return fibLevels; } 
        function getPrice() internal view returns (uint256) { 
            AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeedAddress); 
            (, int price,,,) = priceFeed.latestRoundData(); return uint256(price * 10 ** 10); 
            // Converting to 18 decimal places 
            } 
            }

 