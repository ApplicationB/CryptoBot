require('dotenv').config();
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const mainBotAddress = process.env.MAINBOT_ADDRESS;
const controllerAddress = process.env.CONTROLLER_ADDRESS;
const quicknodeApiKey = process.env.QUICKNODE_PRIVATE;
const quickurln = process.env.QUICKNODE_URL;
// Replace YOUR_QUICKNODE_URL with your QuickNode HTTP Provider URL
const web3 = new Web3( quickurln);

// Replace these addresses with your deployed contract addresses
//const mainBotAddress = '0x182BaF98B655e704034EEB963052a41FBa3e38a6'; // MainBot contract address
//const controllerAddress = '0x4B2eB6Fd561040899B2f147c986AFB0407A0b0be'; // Controller contract address

// Replace YOUR_PRIVATE_KEY with your own Ethereum account private key
const account = web3.eth.accounts.privateKeyToAccount(quicknodeApiKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Load contract ABIs
const mainBotABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'MainBotABI.json'), 'utf8'));
const controllerABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'ControllerABI.json'), 'utf8'));

const mainBot = new web3.eth.Contract(mainBotABI, mainBotAddress);
const controller = new web3.eth.Contract(controllerABI, controllerAddress);

async function checkPrice() {
    const price = await mainBot.methods.checkPrice().call();
    console.log('Current Price:', price);
}

async function initiateTrade(tradeType, amount) {
    await controller.methods.initiateTradeWithHandling(tradeType, amount).send({
        from: account.address,
        gas: 100000,
    });
    console.log(`Trade initiated: ${tradeType} ${amount}`);
}

async function adjustTimeframe(timeframeIndex) {
    await controller.methods.setTradingTimeframe(timeframeIndex).send({
        from: account.address,
        gas: 100000,
    });
    console.log(`Timeframe adjusted to index: ${timeframeIndex}`);
}

async function periodicCheck() {
    await controller.methods.periodicCheck().send({
        from: account.address,
        gas: 100000,
    });
    console.log('Periodic check executed');
}

async function consolidate() {
    await controller.methods.Consolidate().send({
        from: account.address,
        gas: 100000,
    });
    console.log('Consolidation executed');
}

async function withdrawInGwei(amountInGwei) {
    await mainBot.methods.withdrawInGwei(amountInGwei).send({
        from: account.address,
        gas: 100000,
    });
    console.log(`Withdrawn ${amountInGwei} Gwei`);
}

// Example usage
(async () => {
    await checkPrice();
    await initiateTrade('buy', 100);
    await adjustTimeframe(2); // Example: 2 corresponds to 1 hour
    await periodicCheck();
    await consolidate();
    await withdrawInGwei(1000); // Example: withdraw 1000 Gwei
})();
