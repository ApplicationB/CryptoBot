require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
const mainBotAddress = process.env.MAINBOT_ADDRESS;
const controllerAddress = process.env.CONTROLLER_ADDRESS;
const privateKey = process.env.WALLET_PRIVATEKEY;
const quickNodeUrl = process.env.QUICKNODE_URL;
const recipientAddress = process.env.RECIPIENT_ADDRESS; // Your wallet address for receiving funds

// Ensure the private key is in the correct format (0x-prefixed)
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


async function setMainBotController(controllerAddress) {
    const tx = await controller.setMainBotController(controllerAddress);
    await tx.wait();
    console.log('MainBot controller set to:', controllerAddress);
}

async function setMainBotOwner(newOwner) {
    const tx = await controller.setMainBotOwner(newOwner);
    await tx.wait();
    console.log('MainBot owner set to:', newOwner);
}

async function fundMainBot(amount) {
    const tx = await wallet.sendTransaction({
        to: mainBotAddress,
        value: ethers.utils.parseEther(amount.toString()) // Convert the input amount to string and parse to ether
    });
    await tx.wait();
    const newBalance = await wallet.getBalance();
    const mainBotBalance = await provider.getBalance(mainBotAddress);
    console.log(`Funded MainBot with ${amount} ETH\nNew wallet balance: ${ethers.utils.formatEther(newBalance)} ETH`);
    console.log(`MainBot balance: ${ethers.utils.formatEther(mainBotBalance)} ETH`);
}

async function fundController(amount) {
    const tx = await wallet.sendTransaction({
        to: controllerAddress,
        value: ethers.utils.parseEther(amount.toString()) // Convert the input amount to string and parse to ether
    });
    await tx.wait();
    const newBalance = await wallet.getBalance();
    const controllerBalance = await provider.getBalance(controllerAddress);
    console.log(`Funded Controller with ${amount} ETH\nNew wallet balance: ${ethers.utils.formatEther(newBalance)} ETH`);
    console.log(`Controller balance: ${ethers.utils.formatEther(controllerBalance)} ETH`);
    
}

async function withdrawToOwner(amountInWei) {
    const tx = await controller.withdrawToOwner(amountInWei);
    await tx.wait();
    const newBalance = await wallet.getBalance();
    console.log(`Withdrawn ${ethers.utils.formatEther(amountInWei)} ETH to owner\nNew wallet balance: ${ethers.utils.formatEther(newBalance)} ETH`);
}

async function withdrawToAddress(amountInWei, recipient) {
    const tx = await controller.withdrawToAddress(amountInWei, recipient);
    await tx.wait();
    const newBalance = await wallet.getBalance();
    console.log(`Withdrawn ${ethers.utils.formatEther(amountInWei)} ETH to ${recipient}\nNew wallet balance: ${ethers.utils.formatEther(newBalance)} ETH`);
}

async function withdrawFromMainBotInGwei(amountInGwei, recipient) {
    const tx = await controller.withdrawFromMainBotInGwei(amountInGwei, recipient);
    await tx.wait();
    const newBalance = await wallet.getBalance();
    console.log(`Withdrawn ${amountInGwei} Gwei from MainBot to ${recipient}\nNew wallet balance: ${ethers.utils.formatEther(newBalance)} ETH`);
}

async function setTradingTimeframe(timeframeIndex) {
    const tx = await controller.setTradingTimeframe(timeframeIndex);
    await tx.wait();
    console.log('Trading timeframe set');
}

async function consolidate() {
    const tx = await controller.consolidate();
    await tx.wait();
    console.log('Consolidation completed');
}

async function periodicCheck() {
    const tx = await controller.periodicCheck();
    await tx.wait();
    console.log('Periodic check completed');
}

async function initiateTradeWithHandling(tradeType, amount) {
    const tx = await controller.initiateTradeWithHandling(tradeType, amount);
    await tx.wait();
    console.log(`${tradeType} trade of ${amount} executed`);
}

async function emergencyKillA() {
    const tx = await controller.emergencyKillA();
    await tx.wait();
    console.log('Controller emergency kill executed');
}

async function emergencyKillB() {
    const tx = await mainBot.emergencyKillB();
    await tx.wait();
    console.log('MainBot emergency kill executed');
}

async function killBot() {
    const tx = await controller.killBot();
    await tx.wait();
    console.log('MainBot killed via Controller');
}
async function enableTrading() {
    const tx = await mainBot.enableTrading();
     await tx.wait();
   console.log('Trading enabled for MainBot');
       }
async function killBotv3() {
    const tx = await controller.killBotv3();
    await tx.wait();
    console.log('MainBot killed and funds transferred via Controller');
}
async function checkBalance() {
    const controllerBalance = await provider.getBalance(controllerAddress);
    const mainBotBalance = await provider.getBalance(mainBotAddress);
    const balance = await wallet.getBalance();
    console.log('Wallet balance:', ethers.utils.formatEther(balance), 'ETH');
    //console.log(`Funded Controller with ${amount} ETH\nNew wallet balance: ${ethers.utils.formatEther(newBalance)} ETH`);
    console.log(`Controller balance: ${ethers.utils.formatEther(controllerBalance)} ETH`);
    //console.log(`Funded MainBot with ${amount} ETH\nNew wallet balance: ${ethers.utils.formatEther(newBalance)} ETH`);
    console.log(`MainBot balance: ${ethers.utils.formatEther(mainBotBalance)} ETH`);
}

// Add more functions as needed...

(async () => {
    // Example usage

    //These all work as expected, however I had to directly call the mainBot to initiate some functions, symbolizing an issue with gas fees
    await checkBalance();
    await fundMainBot(0.000001); // WORKS// Fund MainBot with 0.1 ETH 
    await fundController(0.000001); // WORKS// Fund Controller with 0.1 ETH
    await withdrawToOwner(ethers.utils.parseEther('0.0000002')); //WORKS//  Withdraw 0.05 ETH to owner
    await checkBalance();
    await mainBot.withdrawToController(20000000000000); //WORKS//  Withdraw 1000000000 Gwei from MainBot to recipient
    await mainBot.setController(wallet.address)
    await mainBot.adjustTimeframe(900) //WORKS//
    await emergencyKillA(); //WORKS //  Execute emergency kill for MainBot Controller
    await emergencyKillB(); // Execute emergency kill for Controller
    await killBot(); //Works// Kill MainBot via Controller
    
    
   /*
    Did not workerData, Gave Error: cannot estimate gas; transaction may fail or may require manual gas limit 
    I think Its an issue where level 2 access to the bot (where the controller actually transacts with the mainBot, and I cant approve the gas causing a failure)
    is it possible to either:
    A output the contracts privateKey (if possible) and add it to the scripts for transacting as that wallet._checkProvider
    B Reformat the project to focus on having all the transactions (that require gas) to be triggered using my wallet address and private key ensuring automation is possible and I can trat the wallet like a gas wallet to pay for transactions for the Bot and controller.
    */
    //Xawait mainBot.withdrawInGwei(100000, wallet.address);
    //await setTradingTimeframe(0); //Gas estimation issue// Set trading timeframe to 15 minutes
        //await killBotv3(); //ISSUE// Kill MainBot and transfer funds via Controller
    //await consolidate(); // Consolidate funds in MainBot
    //await periodicCheck(); // Perform periodic check
    //await initiateTradeWithHandling('buy', 1); // Initiate buy trade of 100
    //await withdrawToAddress(ethers.utils.parseEther('0.00000002'), recipientAddress); // Withdraw 0.05 ETH to recipient
    
/*
    UNPREDICTABLE_GAS_LIMIT
    Error: cannot estimate gas; transaction may fail or may require manual gas limit 
    Error: Only controller can trigger this function","code":"UNPREDICTABLE_GAS_LIMIT"*/
})();
