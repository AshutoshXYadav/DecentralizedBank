const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying DecentralizedBank with Chainlink Keepers...");

  // Deploy the contract
  const DecentralizedBank = await hre.ethers.getContractFactory("DecentralizedBank");
  const bank = await DecentralizedBank.deploy();
  await bank.waitForDeployment();

  const address = await bank.getAddress();
  console.log("✅ DecentralizedBank deployed to:", address);

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId;
  
  console.log("\n📋 Next Steps for True Automation:");
  console.log("=====================================");
  
  if (chainId === 11155111) { // Sepolia
    console.log("🌐 Network: Sepolia Testnet");
    console.log("🔗 Chainlink Keepers URL: https://keepers.chain.link/sepolia");
    console.log("📝 Contract Address:", address);
    console.log("\n📋 Registration Steps:");
    console.log("1. Go to https://keepers.chain.link/sepolia");
    console.log("2. Connect your wallet");
    console.log("3. Click 'Register New Upkeep'");
    console.log("4. Select 'Custom Logic'");
    console.log("5. Enter contract address:", address);
    console.log("6. Set gas limit: 500000");
    console.log("7. Set check interval: 60 (1 minute)");
    console.log("8. Fund the upkeep with LINK tokens");
    console.log("\n💡 The contract will now automatically execute scheduled payments!");
    
  } else if (chainId === 1) { // Mainnet
    console.log("🌐 Network: Ethereum Mainnet");
    console.log("🔗 Chainlink Keepers URL: https://keepers.chain.link/ethereum");
    console.log("📝 Contract Address:", address);
    console.log("\n⚠️  WARNING: This is mainnet! Be very careful with registration.");
    
  } else {
    console.log("🌐 Network: Local/Unknown (Chain ID:", chainId, ")");
    console.log("📝 Contract Address:", address);
    console.log("\n💡 For local testing, you can simulate keepers manually:");
    console.log("   - Call checkUpkeep() to see if payments are ready");
    console.log("   - Call performUpkeep() to execute ready payments");
  }

  console.log("\n🔧 Manual Testing Commands:");
  console.log("============================");
  console.log("// Check if any payments are ready");
  console.log("await bank.checkUpkeep('0x')");
  console.log("\n// Execute ready payments (if any)");
  console.log("await bank.performUpkeep('0x' + readyPaymentIds)");
  
  console.log("\n🎉 Deployment Complete!");
  console.log("Your scheduled payments will now execute automatically once registered with Chainlink Keepers!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 