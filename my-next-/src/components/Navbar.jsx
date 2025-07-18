'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="glass-card bg-black/40 text-white px-4 sm:px-8 py-3 sm:py-4 flex flex-col sm:flex-row sm:gap-8 items-start sm:items-center shadow-lg mb-6 sm:mb-8 border border-white/10 w-full">
      <div className="flex items-center justify-between w-full sm:w-auto mr-0 sm:mr-8">
        <div className="flex items-center">
          <img 
            src="/vaultX.png" 
            alt="VaultX Logo" 
            className="w-8 h-8 mr-2 object-contain"
          />
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-accent">VaultX</span>
        </div>
        {/* Hamburger menu for mobile */}
        <button
          className="sm:hidden ml-auto p-2 focus:outline-none"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>
      {/* Nav links */}
      <div className={`flex-col sm:flex-row gap-2 sm:gap-8 w-full sm:w-auto flex ${menuOpen ? 'flex' : 'hidden'} sm:flex mt-2 sm:mt-0`}> 
        <Link href="/" className="hover:text-accent font-semibold transition-colors px-2 py-1 rounded hover:bg-white/10">Home</Link>
        <Link href="/banking" className="hover:text-accent font-semibold transition-colors px-2 py-1 rounded hover:bg-white/10">Banking</Link>
        <Link href="/lending" className="hover:text-accent font-semibold transition-colors px-2 py-1 rounded hover:bg-white/10">Bitcoin Lending</Link>
        <Link href="/history" className="hover:text-accent font-semibold transition-colors px-2 py-1 rounded hover:bg-white/10">Transaction History</Link>
        <Link href="/scheduled" className="hover:text-accent font-semibold transition-colors px-2 py-1 rounded hover:bg-white/10">Scheduled Payments</Link>
      </div>
    </nav>
  );
}

