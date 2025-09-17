require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337
    }
  }
};