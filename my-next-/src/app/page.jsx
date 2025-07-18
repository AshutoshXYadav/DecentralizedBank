'use client';
import { useWallet } from '@/context/WalletContext';

export default function HomePage() {
  const { account, connectWallet, connecting } = useWallet();
  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4">
      <main className="glass-card w-full max-w-2xl mx-auto p-4 sm:p-8 md:p-10 flex flex-col items-center">
        {/* Logo/Icon */}
        <div className="mb-6 flex flex-col items-center">
          <div className="bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-1 rounded-full shadow-lg hover:scale-110 transition-transform duration-300">
            <img 
              src="/vaultX.png" 
              alt="VaultX Logo" 
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain mix-blend-multiply"
            />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow mt-4 tracking-tight text-center">
            VaultX
          </h1>
          <p className="text-base sm:text-lg text-purple-200 mt-2 text-center max-w-xs">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10 w-full">
          <div className="glass-card flex flex-col items-center p-4 sm:p-6 text-center border border-white/10">
            <span className="text-2xl sm:text-3xl mb-2">🔒</span>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1">Secure Blockchain Banking</h3>
            
          </div>
          <div className="glass-card flex flex-col items-center p-4 sm:p-6 text-center border border-white/10">
            <span className="text-2xl sm:text-3xl mb-2">⚡</span>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1">Instant Crypto Transfers</h3>
          </div>
          <div className="glass-card flex flex-col items-center p-4 sm:p-6 text-center border border-white/10">
            <span className="text-2xl sm:text-3xl mb-2">💸</span>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1">Decentralized Savings</h3>
          </div>
        </div>
      </main>
    </div>
  );
}
