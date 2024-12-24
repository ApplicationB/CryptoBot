require('dotenv').config();
const { ethers, run } = require('hardhat');
const CryptoJS = require('crypto-js');

async function main() {
  // Compile contracts using Hardhat
  await run('compile');

  // Load environment variables
  const quickNodeUrl = process.env.QUICKNODE_URL;
  const privateKey = process.env.WALLET_PRIVATEKEY;
  const polToken = process.env.POL_TOKEN_ADDRESS; 
  const usdtToken = process.env.USDT_TOKEN_ADDRESS; 
  const usdcToken = process.env.USDC_TOKEN_ADDRESS; 
  const quickSwapRouter = process.env.QUICKSWAP_ROUTER_ADDRESS; 
  const priceFeedAddress = process.env.PRICE_FEED_ADDRESS; 
  const uniswapRouter = process.env.UNISWAP_ROUTER_ADDRESS; 
  const uniswapPositionManager = process.env.UNISWAP_POSITION_MANAGER; 
  const aaveLendingPoolAddressesProvider = process.env.AAVE_LENDING_POOL_ADDRESS;

  // Ensure the private key is in the correct format (0x-prefixed)
  const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;

  // Hash the private key using CryptoJS (SHA3-256)
  //const hashedPrivateKey = CryptoJS.SHA3(formattedPrivateKey, { outputLength: 256 }).toString(CryptoJS.enc.Hex);

  // Initialize Ethers.js with QuickNode URL
  const provider = new ethers.providers.JsonRpcProvider(quickNodeUrl);

  // Create an Ethers wallet
  const wallet = new ethers.Wallet(formattedPrivateKey, provider);

  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address,'as:', wallet.address);

  // Verify that artifacts exist
  try {
    await ethers.getContractFactory('MainBot');
    await ethers.getContractFactory('Controller');
  } catch (error) {
    console.error('Contract artifact not found. Ensure that contracts are compiled successfully.');
    throw error;
  }

  // Deploy MainBot contract
  const MainBot = await ethers.getContractFactory('MainBot');
  const mainBot = await MainBot.deploy(polToken, usdtToken, usdcToken, quickSwapRouter, priceFeedAddress, uniswapRouter, uniswapPositionManager, aaveLendingPoolAddressesProvider);
  await mainBot.deployed();
  console.log('MainBot deployed to:', mainBot.address);

  // Deploy Controller contract
  const Controller = await ethers.getContractFactory('Controller');
  const controller = await Controller.deploy(mainBot.address, 900); // Example check interval: 900 seconds (15 minutes)
  await controller.deployed();
  console.log('Controller deployed to:', controller.address);

  // Set the Controller as the owner of MainBot
  
  //await mainBot.setOwner(wallet.address)
  //await mainBot.setController(Controller.address);
  //console.log('Controller not set as owner of MainBot.');
  console.log("Successful Deployment")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


/*
require('dotenv').config();
const Web3 = require('web3');
//const { ethers } = require('ethers');
const { ethers } = require('hardhat');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
const quickNodeUrl = process.env.QUICKNODE_URL;
const privateKey = process.env.WALLET_PRIVATEKEY;
const hashedPrivateKey = CryptoJS.SHA3(privateKey, { outputLength: 256 }).toString();
// Initialize Web3 with QuickNode URL
const provider = new ethers.providers.JsonRpcProvider(quickNodeUrl);


// Create an Ethers wallet
const wallet = new ethers.Wallet(hashedPrivateKey, provider);


// Read contract ABIs and bytecodes
const mainBotPath = path.resolve(__dirname, 'MainBot.sol');
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
// Log the full compilation output for debugging 
console.log(JSON.stringify(output));


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
*/