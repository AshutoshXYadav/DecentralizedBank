require("@nomicfoundation/hardhat-toolbox");


module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.20" },
      { version: "0.8.28" }
    ]
  },
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/c5c88b5735e4432e8a32e553644a3aa3", // or use Alchemy
      accounts: ["6ab4762edf05061c08dcc63638f223f8e58258130369674813ef2f64a568267d"] // private key of your MetaMask account (no 0x prefix)
    }
  }
};
