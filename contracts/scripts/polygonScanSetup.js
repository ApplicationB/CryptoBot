require('dotenv').config();
const axios = require('axios');
//const mainBotAddress = process.env.MAINBOT_ADDRESS;
//const controllerAddress = process.env.CONTROLLER_ADDRESS;
const quicknodeApiKey = process.env.QUICKNODE_PRIVATE;
const quickurln = process.env.QUICKNODE_URL;
// Replace YOUR_POLYGONSCAN_API_KEY with your actual PolygonScan API key
const apiKey = quicknodeApiKey;
const baseUrl = quickurln;

async function getTransactionDetails(txHash) {
    const url = `${baseUrl}?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${apiKey}`;
    const response = await axios.get(url);
    if (response.data.status === '1') {
        console.log('Transaction Details:', response.data.result);
    } else {
        console.log('Error fetching transaction details:', response.data.result);
    }
}

async function getAccountBalance(address) {
    const url = `${baseUrl}?module=account&action=balance&address=${address}&apikey=${apiKey}`;
    const response = await axios.get(url);
    if (response.data.status === '1') {
        console.log('Account Balance:', response.data.result);
    } else {
        console.log('Error fetching account balance:', response.data.result);
    }
}

async function getContractInfo(address) {
    const url = `${baseUrl}?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;
    const response = await axios.get(url);
    if (response.data.status === '1') {
        console.log('Contract Info:', response.data.result);
    } else {
        console.log('Error fetching contract info:', response.data.result);
    }
}

// Example usage
(async () => {
    const txHash = '0xYourTransactionHash'; // Replace with your transaction hash
    const accountAddress = '0xYourAccountAddress'; // Replace with your account address
    const contractAddress = '0xYourContractAddress'; // Replace with your contract address

    await getTransactionDetails(txHash);
    await getAccountBalance(accountAddress);
    await getContractInfo(contractAddress);
})

();
