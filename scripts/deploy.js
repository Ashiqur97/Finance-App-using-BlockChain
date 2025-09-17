const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Finance contract...");

  // Get the contract factory
  const Finance = await ethers.getContractFactory("Finance");

  // Deploy the contract
  const finance = await Finance.deploy();

  // Wait for the contract to be deployed (in ethers v6, we wait for the deployment transaction)
  await finance.waitForDeployment();

  console.log("Finance contract deployed to:", await finance.getAddress());

  // Optional: Log deployment details
  const deploymentTransaction = finance.deploymentTransaction();
  console.log("Deployment transaction hash:", deploymentTransaction.hash);
  console.log("Gas used:", deploymentTransaction.gasLimit.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });