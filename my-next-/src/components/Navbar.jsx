'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="glass-card bg-black/40 text-white px-8 py-4 flex gap-8 items-center shadow-lg mb-8 border border-white/10">
      <span className="text-2xl font-extrabold tracking-tight mr-8 text-accent">VaultX</span>
      <Link href="/" className="hover:text-accent font-semibold transition-colors">Home</Link>
      <Link href="/banking" className="hover:text-accent font-semibold transition-colors">Banking</Link>
      <Link href="/history" className="hover:text-accent font-semibold transition-colors">Transaction History</Link>
      <Link href="/scheduled" className="hover:text-accent font-semibold transition-colors">Scheduled Payments</Link>
    </nav>
  );
}

