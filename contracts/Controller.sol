// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MainBot.sol";

contract Controller {
    MainBot public mainBot;
    address public owner;
    uint256 public checkInterval;
    uint256 public nextCheckTime;

    event LogControllerCheck(uint256 time);
    event LogControllerTrade(string tradeType, uint256 amount);
    event ConsolidationStarted();
    event ConsolidationCompleted();
    event CurrentActivity(string activity);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor(address payable mainBotAddress, uint256 _checkInterval) {
        mainBot = MainBot(mainBotAddress);
        owner = msg.sender;
        checkInterval = _checkInterval; // Set the check interval
        nextCheckTime = block.timestamp + checkInterval;
    }

    function periodicCheck() external onlyOwner {
        require(block.timestamp >= nextCheckTime, "It's not time for the next check yet");
        
        uint256 price = mainBot.checkPrice();
        emit LogControllerCheck(block.timestamp);
        
        // Decide whether to initiate a trade based on the price
        if (price > 1050) { // Example condition
            mainBot.initiateTrade("sell", 100);
            emit LogControllerTrade("sell", 100);
        } else if (price < 950) { // Example condition
            mainBot.initiateTrade("buy", 100);
            emit LogControllerTrade("buy", 100);
        }

        nextCheckTime = block.timestamp + checkInterval;
    }

    function Consolidate() external onlyOwner {
        emit ConsolidationStarted();
        mainBot.convertAllToPOL();
        emit ConsolidationCompleted();
    }

    function handleTradeError(uint256 retryCount) internal {
        if (retryCount >= 3) {
            mainBot.disableTrading();
            emit LogControllerTrade("Stop due to persistent error", 0);
        } else {
            retryCount++;
        }
    }

    function initiateTradeWithHandling(string memory tradeType, uint256 amount) external onlyOwner {
        uint256 retryCount = 0;
        bool success = false;
        while (retryCount < 3 && !success) {
            try mainBot.initiateTrade(tradeType, amount) {
                success = true;
                emit LogControllerTrade(tradeType, amount);
            } catch {
                handleTradeError(retryCount);
            }
        }
    }

    function setTradingTimeframe(uint256 timeframeIndex) external onlyOwner {
        uint256[] memory timeframes = new uint256[](8);
        timeframes[0] = 900;     // 15 minutes
        timeframes[1] = 1800;    // 30 minutes
        timeframes[2] = 3600;    // 1 hour
        timeframes[3] = 7200;    // 2 hours
        timeframes[4] = 14400;   // 4 hours
        timeframes[5] = 28800;   // 8 hours
        timeframes[6] = 86400;   // 24 hours
        timeframes[7] = 604800;  // 1 week

        uint256 selectedTimeframe = timeframes[timeframeIndex];
        mainBot.adjustTimeframe(selectedTimeframe);
        emit LogControllerTrade("Adjusting timeframe", selectedTimeframe);
    }

function kill() external onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
}

    function withdrawInGwei(uint256 amountInGwei) external onlyOwner {
        uint256 amountInWei = amountInGwei * 1 gwei;
        require(address(this).balance >= amountInWei, "Insufficient balance");
        payable(owner).transfer(amountInWei);
    }

    function logEvent(uint256 timestamp, string memory activity) public onlyOwner {
        emit LogControllerCheck(timestamp);
        emit CurrentActivity(activity);
    }
}
