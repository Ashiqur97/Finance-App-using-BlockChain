const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Finance contract...");

  // Get the contract factory
  const Finance = await ethers.getContractFactory("Finance");

  // Deploy the contract
  const finance = await Finance.deploy();

  // Wait for the contract to be deployed
  await finance.deployed();

  console.log("Finance contract deployed to:", finance.address);

  // Optional: Log deployment details
  console.log("Deployment transaction hash:", finance.deployTransaction.hash);
  console.log("Gas used:", finance.deployTransaction.gasLimit.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });