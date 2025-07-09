'use client';

import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';   

export default function Navbar() {
  const { account, connectWallet, connecting } = useWallet();

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center shadow">
      <div className="text-lg font-semibold">🌐 Decentralized Bank</div>
      <div className="flex gap-4 items-center">
        <Link href="/" className="hover:text-gray-200">Home</Link>
        <Link href="/dashboard" className="hover:text-gray-200">Dashboard</Link>
        <Link href="/about" className="hover:text-gray-200">About</Link>
        {account ? (
          <span className="bg-green-600 px-3 py-1 rounded text-xs">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        ) : (
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="bg-blue-500 px-3 py-1 rounded text-xs hover:bg-blue-600"
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </nav>
  );
}

