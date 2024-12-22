require('dotenv').config();
const Web3 = require('web3');
const { ethers } = require('ethers');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
const quickNodeUrl = process.env.QUICKNODE_URL;
const privateKey = process.env.WALLET_PRIVATEKEY;
const hashedPrivateKey = CryptoJS.SHA3(privateKey, { outputLength: 256 }).toString();
// Initialize Web3 with QuickNode URL
//const web3 = new Web3(quickNodeUrl);

// Initialize Ethers with QuickNode URL
const provider = new ethers.JsonRpcProvider(quickNodeUrl);

// Remove the 'QN_' prefix and add '0x' prefix to the private key
//const privateKey = '0x' + quickNodePrivateKey;

// Create an Ethers wallet
const wallet = new ethers.Wallet(hashedPrivateKey, provider);


// Read contract ABIs and bytecodes
const mainBotPath = path.resolve(__dirname,  'MainBot.sol');
const controllerPath = path.resolve(__dirname, 'Controller.sol');
console.log(mainBotPath,controllerPath)
const mainBotSource = fs.readFileSync(mainBotPath, 'utf8');
const controllerSource = fs.readFileSync(controllerPath, 'utf8');

// Compile the contracts using solc
const solc = require('solc');
const input = {
    language: 'Solidity',
    sources: {
        'MainBot.sol': { content: mainBotSource },
        'Controller.sol': { content: controllerSource },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
console.log(output);

const mainBotContract = output.contracts['MainBot.sol']['MainBot'];
const controllerContract = output.contracts['Controller.sol']['Controller'];

async function deploy() {
    // Deploy MainBot contract using Ethers
    const MainBotFactory = new ethers.ContractFactory(mainBotContract.abi, mainBotContract.evm.bytecode.object, wallet);
    const mainBotInstance = await MainBotFactory.deploy();
    await mainBotInstance.deployTransaction.wait();

    console.log('MainBot deployed at:', mainBotInstance.address);

    // Deploy Controller contract using Ethers
    const ControllerFactory = new ethers.ContractFactory(controllerContract.abi, controllerContract.evm.bytecode.object, wallet);
    const controllerInstance = await ControllerFactory.deploy(mainBotInstance.address, 900); // Example check interval: 900 seconds (15 minutes)
    await controllerInstance.deployTransaction.wait();

    console.log('Controller deployed at:', controllerInstance.address);

    // Set the Controller as the owner of MainBot
    const setControllerTx = await mainBotInstance.setController(controllerInstance.address);
    await setControllerTx.wait();

    console.log('Controller set as owner of MainBot');
}

deploy().catch(console.error);
