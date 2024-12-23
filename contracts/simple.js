const fs = require('fs');
const path = require('path');
//console.log(__dirname)
// Load the compiled contract JSON
const mainBotPath = path.resolve(__dirname, '../artifacts/contracts/MainBot.sol/MainBot.json');
const mainBotArtifact = JSON.parse(fs.readFileSync(mainBotPath, 'utf8'));

// Extract the ABI
const mainBotABI = mainBotArtifact.abi;


// Load the compiled contract JSON
const controllerPath = path.resolve(__dirname, '../artifacts/contracts/Controller.sol/Controller.json');
const controllerArtifact = JSON.parse(fs.readFileSync(controllerPath, 'utf8'));
//console.log(controllerPath)
// Extract the ABI
const controllerABI = controllerArtifact.abi;

// Save the ABI to a new file
fs.writeFileSync('ControllerABI.json', JSON.stringify(controllerABI, null, 2));

// Save the ABI to a new file
fs.writeFileSync('MainBotABI.json', JSON.stringify(mainBotABI, null, 2));
console.log("Successful Interaction")