'use client';


import Link from 'next/link';
import { useWallet } from "@/context/WalletContext";




export default function HomePage() {
  const { account, connectWallet } = useWallet();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

      {/* Intro section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">🚀 Welcome to Blockchain Bank</h1>
        <p className="text-gray-700">
          A next-generation decentralized banking platform: crowdfunding, smart contracts, transaction history and more.
        </p>
        <img src="https://images.unsplash.com/photo-1622495891150-cc1c6472c24a" 
             alt="Blockchain bank" 
             className="mx-auto rounded shadow w-full max-w-md" />

        {!account ? (
          <button
            onClick={connectWallet}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Connect Wallet to Get Started
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-green-700">Connected: {account}</p>
            <Link href="/dashboard">
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Go to Dashboard
              </button>
            </Link>
          </div>
        )}
      </section>

      
      

     
     
      
    </main>
  );
}
