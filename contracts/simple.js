require('dotenv').config();
const CryptoJS = require('crypto-js');

// Load environment variables
const quickNodeUrl = process.env.QUICKNODE_URL;
const privateKey = process.env.WALLET_PRIVATEKEY;


// Example private key
//const privateKey = '0xYourPrivateKeyHere';

try {
    // Convert the private key to keccak256 hash using crypto-js
    const hashedPrivateKey = CryptoJS.SHA3(privateKey, { outputLength: 256 }).toString();
    console.log('Keccak256 Hash:', hashedPrivateKey);
} catch (error) {
    console.error('Error:', error.message);
}
