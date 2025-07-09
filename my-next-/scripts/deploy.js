const hre = require("hardhat");

async function main() {
  const Bank = await hre.ethers.getContractFactory("DecentralizedBank");  // must match the contract name
  const bank = await Bank.deploy();
  await bank.waitForDeployment();
  console.log(`✅ Contract deployed to: ${bank.target}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
