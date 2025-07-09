import { ethers, formatEther, parseEther } from "ethers";
import contractABI from "../../../../artifacts/contracts/Bank.sol/DecentralizedBank.json";

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Create provider (Hardhat local node or testnet)
//const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/c5c88b5735e4432e8a32e553644a3aa3");
const newProvider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/...");
// Replace with private key of deployer / backend wallet
const PRIVATE_KEY = "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Create contract instance
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, wallet);

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, address, amount, recipient } = body;

    switch (action) {
      case "getBalance": {
        if (!address) {
          return Response.json({ message: "Address is required" }, { status: 400 });
        }
        const balance = await contract.connect(wallet).getBalance(address);
        return Response.json({ balance: formatEther(balance) });
      }

      case "deposit": {
        if (!amount) return Response.json({ message: "Amount is required" }, { status: 400 });
        // Send ether to contract from wallet
        const tx = await contract.connect(wallet).deposit({ value: parseEther(amount) });
        await tx.wait();
        return Response.json({ message: `Deposited ${amount} ETH` });
      }

      case "withdraw": {
        if (!amount) return Response.json({ message: "Amount is required" }, { status: 400 });
        const tx = await contract.connect(wallet).withdraw(parseEther(amount));
        await tx.wait();
        return Response.json({ message: `Withdrew ${amount} ETH` });
      }

      case "transfer": {
        if (!amount || !recipient) {
          return Response.json({ message: "Recipient and amount are required" }, { status: 400 });
        }
        const tx = await contract.connect(wallet).transfer(recipient, parseEther(amount));
        await tx.wait();
        return Response.json({ message: `Transferred ${amount} ETH to ${recipient}` });
      }

      case "getHistory": {
        if (!address) {
          return Response.json({ message: "Address is required" }, { status: 400 });
        }
        const history = await contract.connect(wallet).getHistory(address);
        return Response.json({ history });
      }

      default:
        return Response.json({ message: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

// Optional GET
export async function GET() {
  return Response.json({ message: "✅ Blockchain API is running!" });
}
