'use client';
import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { formatEther } from 'ethers';

export default function HistoryPage() {
  const { contract, account } = useWallet();
  const [blockchainTransactions, setBlockchainTransactions] = useState([]);

  useEffect(() => {
    if (contract && account) fetchTransactionHistory();
    // eslint-disable-next-line
  }, [contract, account]);

  async function fetchTransactionHistory() {
    if (!contract || !account) return;
    try {
      const history = await contract.getHistory(account);
      const formattedHistory = history.map(tx => {
        const txType = ['Deposit', 'Withdraw', 'TransferOut', 'TransferIn'][Number(tx.txType)];
        const amount = formatEther(tx.amount);
        const timestamp = new Date(Number(tx.timestamp) * 1000).toLocaleString();
        let description = '';
        switch (Number(tx.txType)) {
          case 0:
            description = `Deposited ${amount} ETH`;
            break;
          case 1:
            description = `Withdrew ${amount} ETH`;
            break;
          case 2:
            description = `Sent ${amount} ETH to ${tx.counterparty}`;
            break;
          case 3:
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
      console.error('Error fetching transaction history:', error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="glass-card w-full max-w-3xl mx-auto p-10 flex flex-col items-center animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-2 rounded-full shadow-lg animate-spin mb-2">
            {/* Animated history icon */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="url(#history-gradient)" />
              <path d="M20 10v10l7 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="history-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366F1" />
                  <stop offset="1" stopColor="#A21CAF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white drop-shadow tracking-tight text-center">Transaction History</h1>
          <p className="text-purple-200 mt-2 text-center max-w-xs">View your immutable blockchain transaction history.</p>
        </div>
        {blockchainTransactions.length === 0 ? (
          <p className="text-gray-400">No transactions yet</p>
        ) : (
          <div className="w-full mt-6 space-y-4">
            {blockchainTransactions.map((tx, idx) => (
              <div key={idx} className="glass-card flex items-center gap-4 p-4 border border-white/10 animate-fade-in">
                <div className="flex flex-col items-center">
                  <span className={`text-2xl ${tx.type === 'Deposit' ? 'text-green-400 animate-bounce' : tx.type === 'Withdraw' ? 'text-red-400 animate-pulse' : 'text-blue-400 animate-spin'}`}>{
                    tx.type === 'Deposit' ? '⬆️' : tx.type === 'Withdraw' ? '⬇️' : tx.type === 'TransferOut' ? '🔁' : '🔄'
                  }</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{tx.description}</p>
                  <p className="text-sm text-gray-400">{tx.timestamp}</p>
                </div>
                <span className="px-2 py-1 rounded text-xs font-medium bg-black/30 text-white border border-white/10">
                  {tx.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 