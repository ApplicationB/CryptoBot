require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const {
    checkBalance,
    setMainBotController,
    setMainBotOwner,
    fundMainBot,
    fundController,
    withdrawToOwner,
    withdrawToAddress,
    withdrawFromMainBotInGwei,
    setTradingTimeframe,
    consolidate,
    periodicCheck,
    initiateTradeWithHandling,
    emergencyKillA,
    emergencyKillB,
    killBot,
    enableTrading,
    killBotv3,
    logOwners,
} = require('./Commands');
const mainBotAddress = process.env.MAINBOT_ADDRESS;
const controllerAddress = process.env.CONTROLLER_ADDRESS;
const privateKey = process.env.WALLET_PRIVATEKEY;
const quickNodeUrl = process.env.QUICKNODE_URL;
const recipientAddress = process.env.RECIPIENT_ADDRESS;

const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;


// Initialize Ethers.js with QuickNode URL
const provider = new ethers.providers.JsonRpcProvider(quickNodeUrl);

// Create an Ethers wallet
const wallet = new ethers.Wallet(formattedPrivateKey, provider);


const controllerPath = path.resolve(__dirname, '../artifacts/contracts/Controller.sol/Controller.json');
const controllerArtifact = JSON.parse(fs.readFileSync(controllerPath, 'utf8'));
//const mainBotABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'MainBotABI.json'), 'utf8'));
const mainBotPath = path.resolve(__dirname, '../artifacts/contracts/MainBot.sol/MainBot.json');
const mainBotArtifact = JSON.parse(fs.readFileSync(mainBotPath, 'utf8'));
const mainBotABI = mainBotArtifact.abi;
const mainBot = new ethers.Contract(mainBotAddress, mainBotABI, wallet);
//const controllerABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'ControllerABI.json'), 'utf8'));
const controllerABI = controllerArtifact.abi;

// Create contract instances

const controller = new ethers.Contract(controllerAddress, controllerABI, wallet);

(async () => {
    //await withdrawToOwner(1000000000);
    //await withdrawToAddress(ethers.utils.parseEther('0.05'), wallet.address); // Withdraw 0.05 ETH to recipient
    //await emergencyKillB();
    try {
        await checkBalance();
        // // Log owners of the contracts
        /*await fundMainBot(0.05); // ETH Fund MainBot with 0.1 ETH
        await fundController(0.05); // ETH Fund Controller with 0.1 ETH
        await enableTrading(); // Enable trading for MainBot
        await mainBot.setController(controllerAddress);
        await setMainBotOwner(wallet.address);
        await checkBalance();
        await logOwners();
        */
        //await withdrawToOwner(ethers.utils.parseEther('0.0404999991')); // ETH Withdraw 0.05 ETH to owner
        /*await withdrawToAddress(ethers.utils.parseEther('0.005'), wallet.address); // ETH  Withdraw 0.05 ETH to recipient
        await withdrawToOwner(1000000000, wallet.address); //WEI Withdraw 1000000000 Gwei from MainBot to recipient
        await setTradingTimeframe(0); // Set trading timeframe to 15 minutes
        await consolidate(); // Consolidate funds in MainBot
        await periodicCheck(); // Perform periodic check*/
        //await initiateTradeWithHandling('buy', ethers.utils.parseEther('0.00074')); // Initiate buy trade of ~0.0074 ETH
        //await emergencyKillA(); // Execute emergency kill for Controller
        //await emergencyKillB(); // Execute emergency kill for MainBot
        //await killBot(); // Kill MainBot via Controller
        //await killBotv3(); // Kill MainBot and transfer funds via Controller
        // Add the continuous running loop for your bot
/*
        while (true) {
            try {
                await checkBalance();
                await periodicCheck();

                // Example trade logic
                await initiateTradeWithHandling('buy', ethers.utils.parseEther('0.0074'));
                await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000)); // Wait for 15 minutes
            } catch (error) {
                console.error('Error during bot operation:', error);
                await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000)); // Wait for 15 minutes before retrying
            }
        }
        */
    } catch (error) {
        console.error('Error during test:', error);
    }
})();
