'use client';
import { useWallet } from '@/context/WalletContext';

export default function HomePage() {
  const { account, connectWallet, connecting } = useWallet();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="glass-card w-full max-w-2xl mx-auto p-10 flex flex-col items-center">
        {/* Logo/Icon */}
        <div className="mb-6 flex flex-col items-center">
          <div className="bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-2 rounded-full shadow-lg">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="28" fill="url(#paint0_linear_1_1)" />
              <path d="M18 28L28 18L38 28" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M28 38V18" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="paint0_linear_1_1" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366F1" />
                  <stop offset="1" stopColor="#A21CAF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white drop-shadow mt-4 tracking-tight text-center">
            VaultX
          </h1>
          <p className="text-lg text-purple-200 mt-2 text-center max-w-xs">
            Welcome to VaultX — the next-generation blockchain banking platform.<br/>
            Experience secure, transparent, and instant banking powered by decentralized technology.
          </p>
        </div>
        {/* Wallet Connect UI */}
        <div className="w-full flex flex-col items-center mt-6">
          {account ? (
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-xl shadow-lg font-mono text-center text-lg animate-fade-in">
              Connected: <span className="font-bold">{account.slice(0, 6)}...{account.slice(-4)}</span>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white text-lg font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            >
              {connecting ? 'Connecting...' : 'Authenticate Wallet'}
            </button>
          )}
        </div>
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 w-full">
          <div className="glass-card flex flex-col items-center p-6 text-center border border-white/10">
            <span className="text-3xl mb-2">🔒</span>
            <h3 className="text-lg font-bold text-white mb-1">Secure Blockchain Banking</h3>
            <p className="text-sm text-gray-300">Your assets are protected by decentralized smart contracts and cryptography.</p>
          </div>
          <div className="glass-card flex flex-col items-center p-6 text-center border border-white/10">
            <span className="text-3xl mb-2">⚡</span>
            <h3 className="text-lg font-bold text-white mb-1">Instant Crypto Transfers</h3>
            <p className="text-sm text-gray-300">Send and receive funds globally in seconds, with full transparency and no middlemen.</p>
          </div>
          <div className="glass-card flex flex-col items-center p-6 text-center border border-white/10">
            <span className="text-3xl mb-2">💸</span>
            <h3 className="text-lg font-bold text-white mb-1">Decentralized Savings</h3>
            <p className="text-sm text-gray-300">Grow your wealth with non-custodial, interest-earning savings powered by DeFi.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
