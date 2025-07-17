const hre = require("hardhat");

async function main() {
  console.log("🔗 Chainlink Keepers Registration Helper");
  console.log("========================================");
  
  // Contract details
  const CONTRACT_ADDRESS = "0x118745182A6a240905c936f778cda112321753C1";
  
  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId;
  
  console.log("\n📋 Contract Information:");
  console.log("Contract Address:", CONTRACT_ADDRESS);
  console.log("Network Chain ID:", chainId);
  
  if (chainId === 11155111) {
    console.log("Network: Sepolia Testnet");
    console.log("\n🌐 Registration URL: https://keepers.chain.link/sepolia");
  } else if (chainId === 1) {
    console.log("Network: Ethereum Mainnet");
    console.log("\n🌐 Registration URL: https://keepers.chain.link/ethereum");
  } else {
    console.log("Network: Unknown/Test Network");
    console.log("\n⚠️  Chainlink Keepers may not be available on this network");
  }
  
  console.log("\n📝 Registration Steps:");
  console.log("=======================");
  console.log("1. Go to the registration URL above");
  console.log("2. Connect your wallet (MetaMask)");
  console.log("3. Click 'Register New Upkeep'");
  console.log("4. Select 'Custom Logic'");
  console.log("5. Enter the following details:");
  console.log("   • Contract Address:", CONTRACT_ADDRESS);
  console.log("   • Gas Limit: 500000");
  console.log("   • Check Interval: 60 (1 minute)");
  console.log("   • Starting Balance: 5 LINK");
  console.log("6. Review and confirm registration");
  console.log("7. Fund the upkeep with LINK tokens");
  
  console.log("\n🔧 Technical Details:");
  console.log("=====================");
  console.log("• Upkeep Function: checkUpkeep(bytes calldata)");
  console.log("• Perform Function: performUpkeep(bytes calldata)");
  console.log("• Automation Interface: AutomationCompatibleInterface");
  
  console.log("\n💡 What Happens After Registration:");
  console.log("====================================");
  console.log("✅ Chainlink Keepers will monitor your contract every minute");
  console.log("✅ When scheduled payments are due, they'll execute automatically");
  console.log("✅ Gas costs are covered by the keeper network");
  console.log("✅ No manual intervention required!");
  
  console.log("\n🚀 Your dApp is now ready for true automation!");
  console.log("Create scheduled payments and watch them execute automatically!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 