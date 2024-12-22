require('dotenv').config();
const mainBotAddress = process.env.MAINBOT_ADDRESS;
const controllerAddress = process.env.CONTROLLER_ADDRESS;const Web3 = require('web3');
const quicknodeApiKey = process.env.QUICKNODE_PRIVATE;
const quickurln = process.env.QUICKNODE_URL;
const fs = require('fs');
const path = require('path');

// Replace YOUR_QUICKNODE_URL with your QuickNode HTTP Provider URL
const web3 = new Web3(quickurln);

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

const aaveLendingPoolAddress = '0x7d2768dE32b0b80b7a3454c06BdAc8283Cf1e8bF'; // Aave Lending Pool
const aaveLendingPoolABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'AaveLendingPoolABI.json'), 'utf8'));

const aaveLendingPool = new web3.eth.Contract(aaveLendingPoolABI, aaveLendingPoolAddress);

async function deposit(asset, amount) {
    // Approve the Lending Pool to spend the asset
    const assetContract = new web3.eth.Contract(mainBotABI, asset);
    await assetContract.methods.approve(aaveLendingPoolAddress, amount).send({ from: account.address });

    // Deposit the asset into Aave
    const tx = await aaveLendingPool.methods.deposit(asset, amount, account.address, 0).send({
        from: account.address,
        gas: 500000,
    });
    console.log('Deposit transaction:', tx.transactionHash);
}

async function borrow(asset, amount, interestRateMode) {
    const tx = await aaveLendingPool.methods.borrow(asset, amount, interestRateMode, 0, account.address).send({
        from: account.address,
        gas: 500000,
    });
    console.log('Borrow transaction:', tx.transactionHash);
}

async function repay(asset, amount, rateMode) {
    // Approve the Lending Pool to spend the asset for repayment
    const assetContract = new web3.eth.Contract(mainBotABI, asset);
    await assetContract.methods.approve(aaveLendingPoolAddress, amount).send({ from: account.address });

    // Repay the loan
    const tx = await aaveLendingPool.methods.repay(asset, amount, rateMode, account.address).send({
        from: account.address,
        gas: 500000,
    });
    console.log('Repay transaction:', tx.transactionHash);
}

// Example usage
(async () => {
    const asset = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // USDC on Polygon
    const amount = web3.utils.toWei('1000', 'mwei'); // 1000 USDC in Wei
    const interestRateMode = 2; // 1 for stable rate, 2 for variable rate
    const rateMode = 2; // 1 for stable rate, 2 for variable rate

    await deposit(asset, amount);
    await borrow(asset, amount / 2, interestRateMode);
    await repay(asset, amount / 2, rateMode);
})();
