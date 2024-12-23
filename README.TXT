Execute files.
node deploy.js
node interact.js
node uniswapSetup.js
node aaveSetup.js
node polygonScanSetup.js
node grafanaSetup.js
node discordBotSetup.js

npx hardhat run deploy.js --show-stack-traces
npx hardhat run contracts/interact.js --show-stack-traces
npx hardhat run scripts/uniswapSetup.js --show-stack-traces
npx hardhat run scripts/aaveSetup.js --show-stack-traces
npx hardhat run scripts/polygonScanSetup.js --show-stack-traces
npx hardhat run scripts/grafanaSetup.js --show-stack-traces
npx hardhat run scripts/discordBotSetup.js --show-stack-traces