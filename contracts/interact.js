require('dotenv').config();
const { ethers } = require('hardhat');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');


// Load the compiled contract JSON
const controllerPath = path.resolve(__dirname, '../artifacts/contracts/Controller.sol/Controller.json');
const controllerArtifact = JSON.parse(fs.readFileSync(controllerPath, 'utf8'));

// Load environment variables
const quickNodeUrl = process.env.QUICKNODE_URL;
const privateKey = process.env.WALLET_PRIVATEKEY;
const mainBotAddress = process.env.MAINBOT_ADDRESS;
const controllerAddress = process.env.CONTROLLER_ADDRESS;

// Ensure the private key is in the correct format (0x-prefixed)
const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;

// Initialize Ethers.js with QuickNode URL
const provider = new ethers.providers.JsonRpcProvider(quickNodeUrl);

// Create an Ethers wallet
const wallet = new ethers.Wallet(formattedPrivateKey, provider);
const mainBotPath = path.resolve(__dirname, '../artifacts/contracts/MainBot.sol/MainBot.json');
const mainBotArtifact = JSON.parse(fs.readFileSync(mainBotPath, 'utf8'));
//const mainBotABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'MainBotABI.json'), 'utf8'));
const mainBotABI = mainBotArtifact.abi;
//const controllerABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'ControllerABI.json'), 'utf8'));
const controllerABI = controllerArtifact.abi;

// Create contract instances
const mainBot = new ethers.Contract(mainBotAddress, mainBotABI, wallet);
const controller = new ethers.Contract(controllerAddress, controllerABI, wallet);

async function checkPrice() {
    const price = await mainBot.checkPrice();
    console.log('Current Price:', price.toString());
}

async function initiateTrade(tradeType, amount) {
    const tx = await controller.initiateTradeWithHandling(tradeType, amount);
    await tx.wait();
    console.log(`Trade initiated: ${tradeType} ${amount}`);
}


async function adjustTimeframe(timeframeIndex) {
    const tx = await controller.setTradingTimeframe(timeframeIndex);
    await tx.wait();
    console.log(`Timeframe adjusted to index: ${timeframeIndex}`);
}

async function periodicCheck() {
    const tx = await controller.periodicCheck();
    await tx.wait();
    console.log('Periodic check executed');
}

async function consolidate() {
    const tx = await controller.Consolidate();
    await tx.wait();
    console.log('Consolidation executed');
}

async function withdrawInGwei(amountInGwei) {
    const tx = await mainBot.withdrawInGwei(amountInGwei);
    await tx.wait();
    console.log(`Withdrawn ${amountInGwei} Gwei`);
}

// Example usage
/*
(async () => {
    await checkPrice();
    await initiateTrade('buy', ethers.utils.parseUnits("1.0", "ether"));
    await adjustTimeframe(2); // Example: 2 corresponds to 1 hour
    await periodicCheck();
    await consolidate();
    await withdrawInGwei(1000); // Example: withdraw 1000 Gwei
})();
*/
