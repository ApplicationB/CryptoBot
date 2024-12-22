require('dotenv').config();
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Load environment variables
const quickNodeUrl = process.env.QUICKNODE_URL;
const privateKey = process.env.QUICKNODE_PRIVATE;
//const walletAddress = process.env.WALLET_ADDRESS;
//const mainBotAddress = process.env.MAINBOT_ADDRESS;
//const controllerAddress = process.env.CONTROLLER_ADDRESS;

// Initialize Web3 with QuickNode URL
const web3 = new Web3(quickNodeUrl);

// Update these paths as needed
const mainBotPath = path.resolve(__dirname, 'contracts', 'MainBot.sol');
const controllerPath = path.resolve(__dirname, 'contracts', 'Controller.sol');

// Read contract files
const mainBotSource = fs.readFileSync(mainBotPath, 'utf8');
const controllerSource = fs.readFileSync(controllerPath, 'utf8');

// Replace YOUR_PRIVATE_KEY with your own Ethereum account private key
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

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
const mainBotContract = output.contracts['MainBot.sol']['MainBot'];
const controllerContract = output.contracts['Controller.sol']['Controller'];

async function deploy() {
    // Deploy MainBot contract
    const MainBot = new web3.eth.Contract(mainBotContract.abi);
    const mainBotInstance = await MainBot.deploy({
        data: mainBotContract.evm.bytecode.object,
    }).send({
        from: account.address,
        gas: 5000000,
    });

    console.log('MainBot deployed at:', mainBotInstance.options.address);

    // Deploy Controller contract
    const Controller = new web3.eth.Contract(controllerContract.abi);
    const controllerInstance = await Controller.deploy({
        data: controllerContract.evm.bytecode.object,
        arguments: [mainBotInstance.options.address, 900], // Example check interval: 900 seconds (15 minutes)
    }).send({
        from: account.address,
        gas: 5000000,
    });

    console.log('Controller deployed at:', controllerInstance.options.address);

    // Set the Controller as the owner of MainBot
    await mainBotInstance.methods.setController(controllerInstance.options.address).send({
        from: account.address,
        gas: 100000,
    });

    console.log('Controller set as owner of MainBot');
}

deploy().catch(console.error);
