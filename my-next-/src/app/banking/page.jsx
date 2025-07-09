'use client';
import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { formatEther, parseEther } from 'ethers';

export default function BankingPage() {
  const { contract, account } = useWallet();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  const [balance, setBalance] = useState("");

  useEffect(() => {
    if (contract && account) checkBalance();
    // eslint-disable-next-line
  }, [contract, account]);

  async function checkBalance() {
    setLoading(true);
    try {
      if (!contract || !account) {
        setLoading(false);
        return;
      }
      let bal = await contract.getBalance(account);
      bal = formatEther(bal);
      setBalance(bal);
      setTxStatus('✅ Balance updated!');
    } catch (error) {
      setBalance("0");
      setTxStatus('❌ Failed to fetch balance');
      console.error("Error in checkBalance:", error);
    }
    setLoading(false);
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
    } catch (error) {
      setTxStatus('❌ Withdrawal failed');
      console.error(error);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="glass-card w-full max-w-2xl mx-auto p-10 flex flex-col items-center animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-2 rounded-full shadow-lg animate-bounce mb-2">
            {/* Animated ETH icon */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="url(#eth-gradient)" />
              <path d="M20 8L20 28" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M20 8L28 20L20 28L12 20L20 8Z" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" fill="#fff" fillOpacity="0.15"/>
              <defs>
                <linearGradient id="eth-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366F1" />
                  <stop offset="1" stopColor="#A21CAF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white drop-shadow tracking-tight text-center">Banking</h1>
          <p className="text-purple-200 mt-2 text-center max-w-xs">Deposit, withdraw, and manage your ETH balance securely.</p>
        </div>
        <section className="w-full flex flex-col items-center mb-8">
          <h2 className="text-xl font-semibold mb-2 text-white flex items-center gap-2">
            <span className="animate-pulse">💰</span> Account Balance
          </h2>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-mono text-accent animate-fade-in">{balance} ETH</span>
            <button
              onClick={checkBalance}
              disabled={loading}
              className="ml-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white px-4 py-2 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          {txStatus && <p className="mt-2 text-sm text-green-400 animate-fade-in">{txStatus}</p>}
        </section>
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 flex flex-col items-center border border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Deposit ETH</h2>
            <input
              type="number"
              placeholder="Amount in ETH"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full p-2 mb-3 rounded bg-black/30 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={deposit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-blue-500 hover:to-green-400 text-white font-semibold px-4 py-2 rounded-xl shadow-lg transition-all duration-200"
            >
              Deposit
            </button>
          </div>
          <div className="glass-card p-6 flex flex-col items-center border border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Withdraw ETH</h2>
            <input
              type="number"
              placeholder="Amount in ETH"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full p-2 mb-3 rounded bg-black/30 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={withdraw}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 text-white font-semibold px-4 py-2 rounded-xl shadow-lg transition-all duration-200"
            >
              Withdraw
            </button>
          </div>
        </section>
      </main>
    </div>
  );
} 