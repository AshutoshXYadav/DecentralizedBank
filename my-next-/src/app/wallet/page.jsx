'use client';
import { useWallet } from '@/context/WalletContext';

export default function WalletPage() {
  const { account, connectWallet, connecting } = useWallet();
  return (
    <main className="max-w-md mx-auto p-8 mt-10 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Wallet Connection</h1>
      {account ? (
        <div className="text-green-700 font-mono mb-2">Connected: {account}</div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={connecting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </main>
  );
} 