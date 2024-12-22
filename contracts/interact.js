require('dotenv').config();
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Load environment variables
const quickNodeUrl = process.env.QUICKNODE_URL;
const privateKey = process.env.QUICKNODE_PRIVATE;
const mainBotAddress = process.env.MAINBOT_ADDRESS;
const controllerAddress = process.env.CONTROLLER_ADDRESS;

// Initialize Web3 with QuickNode URL
const web3 = new Web3(quickNodeUrl);

// Replace YOUR_PRIVATE_KEY with your own Ethereum account private key
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
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
