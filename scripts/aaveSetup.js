require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
const mainBotAddress = process.env.MAINBOT_ADDRESS;
const controllerAddress = process.env.CONTROLLER_ADDRESS;
const privateKey = process.env.WALLET_PRIVATEKEY;
const quickNodeUrl = process.env.QUICKNODE_URL;

// Ensure the private key is in the correct format (0x-prefixed)
const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;

// Initialize Ethers.js with QuickNode URL
const provider = new ethers.providers.JsonRpcProvider(quickNodeUrl);

// Create an Ethers wallet
const wallet = new ethers.Wallet(formattedPrivateKey, provider);
console.log(__dirname)