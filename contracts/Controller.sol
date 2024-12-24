// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MainBot.sol";

contract Controller {
    MainBot public mainBot;
    address public owner;
    uint256 public checkInterval;
    uint256 public nextCheckTime;
    uint256 public initialDeposit;
    uint256 public weiBalance;
    uint256 public stablecoinBalance;

    event LogControllerCheck(uint256 time);
    event LogControllerTrade(string tradeType, uint256 amount);
    event ConsolidationStarted();
    event ConsolidationCompleted();
    event CurrentActivity(string activity);
    event MainBotKilled(string info);
    event MainBotKillFailed(string reason);

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

    function consolidate() external onlyOwner {
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

    function emergencyKillA() external onlyOwner {
        payable(owner).transfer(address(this).balance);
        //selfdestruct(payable(owner));
    }

    function killBot() external onlyOwner {
        try mainBot.kill() {
            // Successfully killed MainBot
            emit MainBotKilled("Controller paid the gas fee");
        } catch {
            // Handle failure if needed
            emit MainBotKillFailed("Controller failed to kill MainBot");
        }
    }

    function killBotv3() external onlyOwner {
        // Attempt to kill MainBot with Controller paying the gas fee
        try mainBot.kill() {
            // Successfully killed MainBot
            emit MainBotKilled("Controller paid the gas fee");
            // Transfer funds from MainBot to Controller
            mainBot.withdrawToController(address(mainBot).balance);
            // Transfer funds from Controller to owner
            payable(owner).transfer(address(this).balance);
        } catch {
            // Attempt to kill MainBot with MainBot paying the gas fee
            try this.killMainBotWithController() {
                // Successfully killed MainBot
                emit MainBotKilled("MainBot paid the gas fee");
                // Transfer funds from MainBot to Controller
                mainBot.withdrawToController(address(mainBot).balance);
                // Transfer funds from Controller to owner
                payable(owner).transfer(address(this).balance);
            } catch {
                // Attempt to kill MainBot with Owner paying the gas fee
                try this.killMainBotWithOwner() {
                    // Successfully killed MainBot
                    emit MainBotKilled("Owner paid the gas fee");
                    // Transfer funds from MainBot to Controller
                    mainBot.withdrawToController(address(mainBot).balance);
                    // Transfer funds from Controller to owner
                    payable(owner).transfer(address(this).balance);
                } catch {
                    // All attempts failed, output the issue
                    emit MainBotKillFailed("All attempts to kill MainBot failed");
                }
            }
        }
    }

    function killMainBotWithController() external {
        require(msg.sender == address(this), "Can only be called by the contract itself");
        mainBot.kill();
    }

    function killMainBotWithOwner() external {
        require(msg.sender == owner, "Can only be called by the owner");
        mainBot.kill();
    }

    function setMainBotController(address _controller) external onlyOwner {
        mainBot.setController(_controller);
    }

    function setMainBotOwner(address newOwner) external onlyOwner {
        mainBot.setOwner(newOwner);
    }

    function withdrawToOwner(uint256 amountInWei) external onlyOwner {
        require(address(this).balance >= amountInWei, "Insufficient balance");
        payable(owner).transfer(amountInWei);
    }

    function withdrawToAddress(uint256 amountInWei, address recipient) external onlyOwner {
        require(address(this).balance >= amountInWei, "Insufficient balance");
        require(recipient != address(0), "Invalid address");
        payable(recipient).transfer(amountInWei);
    }

    receive() external payable {
        initialDeposit += msg.value;
        weiBalance += (msg.value * 70) / 100;
        stablecoinBalance += (msg.value * 30) / 100;
    }

    function withdrawInGwei(uint256 amountInGwei) external onlyOwner {
        uint256 amountInWei = amountInGwei * 1 gwei;
        require(address(this).balance >= amountInWei, "Insufficient balance");
        payable(owner).transfer(amountInWei);
    }

    function withdrawFromMainBotInGwei(uint256 amountInGwei, address recipient) external onlyOwner {
        mainBot.withdrawInGwei(amountInGwei, recipient);
    }

    function logEvent(uint256 timestamp, string memory activity) public onlyOwner {
        emit LogControllerCheck(timestamp);
        emit CurrentActivity(activity);
    }
}
