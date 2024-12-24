// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.20;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3SwapCallback.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";


contract PortfolioManager {
    address private owner;
    IUniswapV3Pool private uniswapPool;
    IUniswapV3Factory private uniswapFactory;
    IUniswapV3SwapCallback private uniswapCalleeRecipient;
    ISwapRouter public immutable swapRouter;

    event TradeExecuted(address indexed user, string tradeType, uint256 amount, uint256 received, uint256 price);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can execute this function");
        _;
    }

    constructor(address _uniswapRouterAddress, address _uniswapFactoryAddress, address _uniswapPoolAddress) {
        owner = msg.sender;
        swapRouter = ISwapRouter(_uniswapRouterAddress);
        uniswapFactory = IUniswapV3Factory(_uniswapFactoryAddress);
        uniswapPool = IUniswapV3Pool(_uniswapPoolAddress);
        uniswapCalleeRecipient = IUniswapV3SwapCallback(msg.sender);
    }
    function initiateTrade(string memory tradeType, uint256 amount) external onlyOwner {
        address tokenIn = address(this); // Token you are selling 
        address tokenOut = uniswapPool.token1(); // Token you are buying (e.g., ETH)
        uint24 fee = 3000; // Assuming pool fee is 0.3%
        ISwapRouter.ExactInputSingleParams memory params = 
            ISwapRouter.ExactInputSingleParams({ 
                tokenIn: tokenIn, 
                tokenOut: tokenOut, 
                fee: fee, 
                recipient: msg.sender, 
                deadline: block.timestamp, 
                amountIn: amount, 
                amountOutMinimum: 0, 
                sqrtPriceLimitX96: 0 
                });
        uint256 amountOut = swapRouter.exactInputSingle(params); 
        emit TradeExecuted(msg.sender, tradeType, amount, amountOut, getPrice()); 
        }

/*
    function initiateTrade(string memory tradeType, uint256 amount) external onlyOwner {
        address[] memory path = new address[](2);
        path[0] = address(this);  // Token you are selling
        path[1] = uniswapPool.token1();  // Token you are buying (e.g., ETH)

        uint256[] memory amounts = uniswapPool.swapExactTokensForTokens(
            amount,
            0, // Minimum amount out (set to 0 for simplicity)
            path,
            msg.sender,
            block.timestamp
        );

        

        emit TradeExecuted(msg.sender, tradeType, amount, amounts[1], getPrice());
    }
*/
    function convertAllToPOL() external onlyOwner {
        // Similar logic to initiateTrade but for converting to POL
        emit TradeExecuted(msg.sender, "convert to POL", 0, 0, getPrice());
    }

    function getPrice() public pure virtual returns (uint256) {
        // Implement price fetching logic here
        return 0;
    }
}