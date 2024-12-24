require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
const mainBotAddress = process.env.MAINBOT_ADDRESS;
const controllerAddress = process.env.CONTROLLER_ADDRESS;
const privateKey = process.env.WALLET_PRIVATEKEY;
const quickNodeUrl = process.env.QUICKNODE_URL;
const recipientAddress = process.env.WALLET_ADDRESS; // Your wallet address for receiving funds

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
// Load contract ABI
//const mainBotABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, './MainBotABI.json'), 'utf8'));

// Create contract instance
//const mainBot = new ethers.Contract(mainBotAddress, mainBotABI, wallet);

async function checkBalance() {
    const balance = await wallet.getBalance();
    console.log('Wallet balance:', ethers.utils.formatEther(balance), 'ETH');// 'address:', wallet.address
}

async function fundMainBot(amount) {
    // Fund the MainBot contract
    const tx = await wallet.sendTransaction({
        to: mainBotAddress,
        value: ethers.utils.parseEther(amount.toString()) // Convert the input amount to string and parse to ether
    });
    await tx.wait();
    
    // Fetch the updated wallet balance
    const newBalance = await wallet.getBalance();
    
    // Fetch the MainBot contract balance
    const mainBotBalance = await provider.getBalance(mainBotAddress);
    
    // Fetch the Controller contract balance
    const controllerBalance = await provider.getBalance(controllerAddress);

    // Display the balances
    console.log(`Funded MainBot with ${amount} ETH\nNew wallet balance: ${ethers.utils.formatEther(newBalance)} ETH`);
    console.log(`MainBot balance: ${ethers.utils.formatEther(mainBotBalance)} ETH`);
    console.log(`Controller balance: ${ethers.utils.formatEther(controllerBalance)} ETH`);
}

async function testKill() { try {
     // Fetch initial balances 
     const initialBalance = await wallet.getBalance(); 
     const initialMainBotBalance = await provider.getBalance(mainBotAddress); 
     const initialControllerBalance = await provider.getBalance(controllerAddress); 
     console.log(`Initial wallet balance: ${ethers.utils.formatEther(initialBalance)} MATIC`); 
     console.log(`Initial MainBot balance: ${ethers.utils.formatEther(initialMainBotBalance)} MATIC`); 
     console.log(`Initial Controller balance: ${ethers.utils.formatEther(initialControllerBalance)} MATIC`); 
     // Wait for 5 minutes (300,000 milliseconds) console.log('Waiting for 5 minutes before killing the contract...'); 
     await new Promise(resolve => setTimeout(resolve, 30)); // Call 
     //kill function from Controller contract 

     //const killTx = await mainBot.setController(); 
     const killTx = await mainBot.kill(); 
     await killTx.wait(); console.log('Contract killed, funds sent to:', recipientAddress); 
     // Fetch balances after killing the contract 
     const finalBalance = await wallet.getBalance(); 
     const finalMainBotBalance = await provider.getBalance(mainBotAddress); 
     const finalControllerBalance = await provider.getBalance(controllerAddress); 
     console.log(`Final wallet balance: ${ethers.utils.formatEther(finalBalance)} MATIC`); 
     console.log(`Final MainBot balance: ${ethers.utils.formatEther(finalMainBotBalance)} MATIC`); 
     console.log(`Final Controller balance: ${ethers.utils.formatEther(finalControllerBalance)} MATIC`); 
    } 
    catch (error) { 
        console.error('Error:', error); 
    }
 }

// Execute the script
(async () => {
    await checkBalance();
    await fundMainBot(0.00002);
    await testKill();
})();



