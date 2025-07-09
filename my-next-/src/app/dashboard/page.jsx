'use client';
import { useState, useEffect } from 'react';
import { useWallet } from "@/context/WalletContext";
import { formatEther, parseEther } from "ethers";

export default function HomePage() {
  const { contract, account, connectWallet, connecting } = useWallet();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  const [balance, setBalance] = useState("");
  const [blockchainTransactions, setBlockchainTransactions] = useState([]);
  const [customAddress, setCustomAddress] = useState("");

  useEffect(() => {
    if (contract && account) {
      checkBalance();
      // Only fetch history if we have a valid address
      const addressToCheck = customAddress || account;
      if (addressToCheck && /^0x[a-fA-F0-9]{40}$/.test(addressToCheck)) {
        fetchTransactionHistory();
      }
    }
    // eslint-disable-next-line
  }, [contract, account, customAddress]);

  async function checkBalance() {
    console.log("checkBalance called, contract:", contract, "account:", account);
    if (!contract) return;
    setLoading(true);
    try {
      const addressToCheck = customAddress || account;
      console.log("Checking balance for:", addressToCheck); // Debug log
      if (!addressToCheck) {
        setBalance("");
        setLoading(false);
        return;
      }
      // Validate Ethereum address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(addressToCheck)) {
        setBalance("0");
        setTxStatus('❌ Invalid address');
        setLoading(false);
        return;
      }
      let bal = await contract.getBalance(addressToCheck);
      bal = formatEther(bal);
      setBalance(bal);
      setTxStatus('✅ Balance updated!');
    } catch (error) {
      setBalance("0");
      setTxStatus('❌ Failed to fetch balance');
      console.error("Error in checkBalance:", error); // Debug log
    }
    setLoading(false);
  }

  async function fetchTransactionHistory() {
    if (!contract) return;
    try {
      const addressToCheck = customAddress || account;
      if (!addressToCheck) return;
      
      // Validate Ethereum address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(addressToCheck)) {
        console.log("Invalid address format for history fetch:", addressToCheck);
        return;
      }
      
      const history = await contract.getHistory(addressToCheck);
      const formattedHistory = history.map(tx => {
        const txType = ['Deposit', 'Withdraw', 'TransferOut', 'TransferIn'][Number(tx.txType)];
        const amount = formatEther(tx.amount);
        const timestamp = new Date(Number(tx.timestamp) * 1000).toLocaleString();
        
        let description = '';
        switch (Number(tx.txType)) {
          case 0: // Deposit
            description = `Deposited ${amount} ETH`;
            break;
          case 1: // Withdraw
            description = `Withdrew ${amount} ETH`;
            break;
          case 2: // TransferOut
            description = `Sent ${amount} ETH to ${tx.counterparty}`;
            break;
          case 3: // TransferIn
            description = `Received ${amount} ETH from ${tx.counterparty}`;
            break;
        }
        
        return {
          description,
          timestamp,
          type: txType,
          amount,
          counterparty: tx.counterparty
        };
      });
      
      setBlockchainTransactions(formattedHistory);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    }
  }

  async function deposit() {
    if (!contract || !amount) return;
    setLoading(true);
    setTxStatus('');
    try {
      const tx = await contract.deposit({ value: parseEther(amount) });
      await tx.wait();
      setTxStatus('✅ Deposit successful');
      checkBalance();
      fetchTransactionHistory(); // Refresh transaction history from blockchain
    } catch (error) {
      setTxStatus('❌ Deposit failed');
      console.error(error);
    }
    setLoading(false);
  }

  async function withdraw() {
    if (!contract || !amount) return;
    setLoading(true);
    setTxStatus('');
    try {
      const tx = await contract.withdraw(parseEther(amount));
      await tx.wait();
      setTxStatus('✅ Withdrawal successful');
      checkBalance();
      fetchTransactionHistory(); // Refresh transaction history from blockchain
    } catch (error) {
      setTxStatus('❌ Withdrawal failed');
      console.error(error);
    }
    setLoading(false);
  }

  async function transfer() {
    if (!contract || !amount || !customAddress) return;
    setLoading(true);
    setTxStatus('');
    try {
      const tx = await contract.transfer(customAddress, parseEther(amount));
      await tx.wait();
      setTxStatus('✅ Transfer successful');
      checkBalance();
      fetchTransactionHistory(); // Refresh transaction history from blockchain
    } catch (error) {
      setTxStatus('❌ Transfer failed');
      console.error(error);
    }
    setLoading(false);
  }

  return (
    <main className="max-w-3xl mx-auto p-6 font-sans space-y-8">
      <h1 className="text-3xl font-bold text-center text-blue-700">🚀 Blockchain Banking Dashboard</h1>
      <p className="text-center text-gray-600">Manage your decentralized bank on Ethereum</p>

      {/* Connect Wallet */}
      <section className="bg-gray-100 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">🔑 Connect Wallet</h2>
        <div className="w-full p-2 border border-gray-300 rounded mb-3 bg-white">
          {account ? (
            <span className="text-green-700 font-mono">{account}</span>
          ) : (
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
        <div className="mb-3">
          <input
            type="text"
            placeholder="Or enter address to check balance"
            value={customAddress}
            onChange={e => setCustomAddress(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          onClick={async () => {
            await checkBalance();
            // Also fetch history for the custom address if it's valid
            if (customAddress && /^0x[a-fA-F0-9]{40}$/.test(customAddress)) {
              await fetchTransactionHistory();
            }
          }}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Loading...' : 'Check Balance'}
        </button>
        {txStatus && (
          <p className="mt-2 text-sm text-green-600">{txStatus}</p>
        )}
      </section>

      {/* Balance Section */}
      <section className="bg-gray-50 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">💰 Account Balance</h2>
        {balance !== null ? (
          <p className="text-lg font-bold">{balance} ETH</p>
        ) : (
          <p className="text-gray-500">Balance will appear after checking</p>
        )}
      </section>

      {/* Deposit / Withdraw / Transfer */}
      <section className="bg-gray-100 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">💸 Deposit / Withdraw / Transfer ETH</h2>
        <input
          type="number"
          placeholder="Amount in ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-3"
        />
        <div className="flex gap-3 mb-3">
          <button
            onClick={deposit}
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Deposit
          </button>
          <button
            onClick={withdraw}
            disabled={loading}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Withdraw
          </button>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Recipient address for transfer"
            value={customAddress}
            onChange={e => setCustomAddress(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded"
          />
          <button
            onClick={transfer}
            disabled={loading || !customAddress}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
          >
            Transfer
          </button>
        </div>
      </section>

      {/* Transaction History */}
      <section className="bg-gray-50 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">📜 Blockchain Transaction History</h2>
        {blockchainTransactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {blockchainTransactions.map((tx, idx) => (
              <div key={idx} className="bg-white p-3 rounded border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-gray-600">{tx.timestamp}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    tx.type === 'Deposit' ? 'bg-green-100 text-green-800' :
                    tx.type === 'Withdraw' ? 'bg-red-100 text-red-800' :
                    tx.type === 'TransferOut' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {tx.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Planned Features */}
      
    </main>
  );
}

