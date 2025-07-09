// src/components/ClientLayout.jsx
"use client";  // ← important for client components

import React from 'react';
import { WalletProvider } from '../context/WalletContext';

// adjust path if needed
import Navbar from './Navbar'; // adjust path if needed

export default function ClientLayout({ children }) {
  return (
    <WalletProvider>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </WalletProvider>
  );
}

