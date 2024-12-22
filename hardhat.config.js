require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    myQuickNode: {
      url: "https://damp-responsive-sea.zkevm-mainnet.quiknode.pro/0a24d53b23c80a3a422f12936066caf962811100/",
      accounts: [
        "0x706fDbD597380512ac76695120be0Cb0D32A43e9",
      ],
    },
  },
  solidity: "0.8.19",
};