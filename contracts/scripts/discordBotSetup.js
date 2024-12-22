//npm install discord.js dotenv web3 fs

const { Client, Intents } = require('discord.js');
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Discord Bot Token and QuickNode URL from .env file
const discordToken = process.env.DISCORD_TOKEN;
const quickNodeUrl = process.env.QUICKNODE_URL;
const mainBotAddress = process.env.MAINBOT_ADDRESS;
const controllerAddress = process.env.CONTROLLER_ADDRESS;
const web3 = new Web3(quickNodeUrl);

// Replace these addresses with your deployed contract addresses
//const mainBotAddress = '0x182BaF98B655e704034EEB963052a41FBa3e38a6'; // MainBot contract address
//const controllerAddress = '0x4B2eB6Fd561040899B2f147c986AFB0407A0b0be'; // Controller contract address

// Load contract ABIs
const mainBotABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'MainBotABI.json'), 'utf8'));
const controllerABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'ControllerABI.json'), 'utf8'));

const mainBot = new web3.eth.Contract(mainBotABI, mainBotAddress);
const controller = new web3.eth.Contract(controllerABI, controllerAddress);

// Create a new Discord client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
    console.log('Discord bot is ready!');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    if (command === '!balance') {
        const address = args[0];
        const balance = await web3.eth.getBalance(address);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');
        message.channel.send(`Balance of ${address}: ${balanceInEth} ETH`);
    } else if (command === '!price') {
        const price = await mainBot.methods.checkPrice().call();
        message.channel.send(`Current Price: ${price}`);
    } else if (command === '!trade') {
        const tradeType = args[0];
        const amount = web3.utils.toWei(args[1], 'ether');
        await controller.methods.initiateTradeWithHandling(tradeType, amount).send({
            from: process.env.WALLET_ADDRESS,
            gas: 100000,
        });
        message.channel.send(`Trade initiated: ${tradeType} ${amount}`);
    } else if (command === '!consolidate') {
        await controller.methods.Consolidate().send({
            from: process.env.WALLET_ADDRESS,
            gas: 100000,
        });
        message.channel.send('Consolidation executed');
    }
});

// Login to Discord with your app's token
client.login(discordToken);
