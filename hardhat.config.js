require('dotenv').config();
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
const path = require('path');
const CryptoJS = require('crypto-js');

// Load environment variables
const privateKey = process.env.WALLET_PRIVATEKEY;
const quickNodeUrl = process.env.QUICKNODE_URL;

// Ensure the private key is in the correct format (0x-prefixed)
const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;

// Hash the private key using CryptoJS (SHA3-256)
const hashedPrivateKey = CryptoJS.SHA3(formattedPrivateKey, { outputLength: 256 }).toString(CryptoJS.enc.Hex);

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
    },
    /*localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    }*/
    myQuickNode: {
      url: quickNodeUrl,
      accounts: [hashedPrivateKey],
    }},
  
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: path.join(__dirname, 'contracts'),
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};
