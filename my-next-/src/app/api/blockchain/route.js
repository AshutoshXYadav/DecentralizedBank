import { ethers, formatEther, parseEther } from "ethers";
import contractABI from "../../../../artifacts/contracts/Bank.sol/DecentralizedBank.json";

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x118745182A6a240905c936f778cda112321753C1"; 
// Create provider (Hardhat local node or testnet)
const newProvider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/2d80630540c9409c9f4c2e6849b54e83");
// Replace with private key of deployer / backend wallet
const PRIVATE_KEY = "6ab4762edf05061c08dcc63638f223f8e58258130369674813ef2f64a568267d";
const wallet = new ethers.Wallet(PRIVATE_KEY, newProvider);

// Create contract instance
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, wallet);

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("API /api/blockchain POST called with body:", body);
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

      // Scheduled Payment Operations
      case "createScheduledPayment": {
        const { recipient, amount, frequency, totalPayments, description } = body;
        if (!recipient || !amount || !frequency) {
          return Response.json({ message: "Recipient, amount, and frequency are required" }, { status: 400 });
        }
        const tx = await contract.connect(wallet).createScheduledPayment(
          recipient,
          parseEther(amount),
          frequency,
          totalPayments || 0,
          description || ""
        );
        await tx.wait();
        return Response.json({ message: `Scheduled payment created for ${amount} ETH` });
      }

      case "executeScheduledPayment": {
        const { paymentId } = body;
        if (!paymentId) {
          return Response.json({ message: "Payment ID is required" }, { status: 400 });
        }
        const tx = await contract.connect(wallet).executeScheduledPayment(paymentId);
        await tx.wait();
        return Response.json({ message: `Scheduled payment ${paymentId} executed` });
      }

      case "cancelScheduledPayment": {
        const { paymentId } = body;
        if (!paymentId) {
          return Response.json({ message: "Payment ID is required" }, { status: 400 });
        }
        const tx = await contract.connect(wallet).cancelScheduledPayment(paymentId);
        await tx.wait();
        return Response.json({ message: `Scheduled payment ${paymentId} cancelled` });
      }

      case "updateScheduledPayment": {
        const { paymentId, newAmount, newFrequency } = body;
        if (!paymentId || !newAmount || !newFrequency) {
          return Response.json({ message: "Payment ID, new amount, and new frequency are required" }, { status: 400 });
        }
        const tx = await contract.connect(wallet).updateScheduledPayment(
          paymentId,
          parseEther(newAmount),
          newFrequency
        );
        await tx.wait();
        return Response.json({ message: `Scheduled payment ${paymentId} updated` });
      }

      case "getUserScheduledPayments": {
        if (!address) {
          return Response.json({ message: "Address is required" }, { status: 400 });
        }
        const paymentIds = await contract.connect(wallet).getUserScheduledPayments(address);
        const payments = [];
        for (const id of paymentIds) {
          const payment = await contract.connect(wallet).getScheduledPayment(id);
          payments.push({
            id: payment.id.toString(),
            sender: payment.sender,
            recipient: payment.recipient,
            amount: formatEther(payment.amount),
            frequency: payment.frequency.toString(),
            nextPaymentTime: new Date(Number(payment.nextPaymentTime) * 1000).toISOString(),
            totalPayments: payment.totalPayments.toString(),
            paymentsMade: payment.paymentsMade.toString(),
            isActive: payment.isActive,
            description: payment.description
          });
        }
        return Response.json({ payments });
      }

      case "getReadyScheduledPayments": {
        const readyPaymentIds = await contract.connect(wallet).getReadyScheduledPayments();
        const readyPayments = [];
        for (const id of readyPaymentIds) {
          const payment = await contract.connect(wallet).getScheduledPayment(id);
          readyPayments.push({
            id: payment.id.toString(),
            sender: payment.sender,
            recipient: payment.recipient,
            amount: formatEther(payment.amount),
            frequency: payment.frequency.toString(),
            nextPaymentTime: new Date(Number(payment.nextPaymentTime) * 1000).toISOString(),
            totalPayments: payment.totalPayments.toString(),
            paymentsMade: payment.paymentsMade.toString(),
            isActive: payment.isActive,
            description: payment.description
          });
        }
        return Response.json({ readyPayments });
      }

      case "getScheduledPayment": {
        const { paymentId } = body;
        if (!paymentId) {
          return Response.json({ message: "Payment ID is required" }, { status: 400 });
        }
        const payment = await contract.connect(wallet).getScheduledPayment(paymentId);
        return Response.json({
          payment: {
            id: payment.id.toString(),
            sender: payment.sender,
            recipient: payment.recipient,
            amount: formatEther(payment.amount),
            frequency: payment.frequency.toString(),
            nextPaymentTime: new Date(Number(payment.nextPaymentTime) * 1000).toISOString(),
            totalPayments: payment.totalPayments.toString(),
            paymentsMade: payment.paymentsMade.toString(),
            isActive: payment.isActive,
            description: payment.description
          }
        });
      }

      case "testAutomation": {
        try {
          // Simulate Chainlink Keepers automation
          const readyPaymentIds = await contract.connect(wallet).getReadyScheduledPayments();
          if (!readyPaymentIds || readyPaymentIds.length === 0) {
            return Response.json({ message: "ℹ️ No payments ready for execution at this time." });
          }
          let executedCount = 0;
          for (const paymentId of readyPaymentIds) {
            try {
              const tx = await contract.connect(wallet).executeScheduledPayment(paymentId);
              await tx.wait();
              executedCount++;
            } catch (error) {
              console.error(`Failed to execute payment ${paymentId}:`, error);
            }
          }
          if (executedCount > 0) {
            return Response.json({
              message: `✅ Automation test successful! Executed ${executedCount} payments automatically.`
            });
          } else {
            return Response.json({
              message: "ℹ️ No payments were executed. They may have already been processed or failed."
            });
          }
        } catch (error) {
          console.error("testAutomation API error:", error);
          return Response.json({ message: "Server error in testAutomation", error: error.message }, { status: 500 });
        }
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
