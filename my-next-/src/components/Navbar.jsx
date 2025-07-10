'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="glass-card bg-black/40 text-white px-8 py-4 flex gap-8 items-center shadow-lg mb-8 border border-white/10">
      <div className="flex items-center mr-8">
        <img 
          src="/vaultX.png" 
          alt="VaultX Logo" 
          className="w-8 h-8 mr-2 object-contain"
        />
        <span className="text-2xl font-extrabold tracking-tight text-accent">VaultX</span>
      </div>
      <Link href="/" className="hover:text-accent font-semibold transition-colors">Home</Link>
      <Link href="/dashboard" className="hover:text-accent font-semibold transition-colors">Banking</Link>
      <Link href="/lending" className="hover:text-accent font-semibold transition-colors">Bitcoin Lending</Link>
      <Link href="/history" className="hover:text-accent font-semibold transition-colors">Transaction History</Link>
      <Link href="/scheduled" className="hover:text-accent font-semibold transition-colors">Scheduled Payments</Link>
    </nav>
  );
}

