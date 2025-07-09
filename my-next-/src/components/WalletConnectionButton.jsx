'use client';
import { useWallet } from '../context/WalletContext';
import {useState} from 'react';

export default function WalletConnectionButton() {
  const { account, connectWallet } = useWallet();

  return (
    <div>
      {account ? (
        <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm">
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </button>
      ) : (
        <button onClick={connectWallet} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
          Connect Wallet
        </button>
      )}
    </div>
  );
}
