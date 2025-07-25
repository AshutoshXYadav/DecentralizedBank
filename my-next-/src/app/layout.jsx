// src/app/layout.jsx

import '../styles/global.css';
import { Geist, Geist_Mono } from 'next/font/google';
import ClientLayout from '../components/ClientLayout';
import Navbar from '../components/Navbar';
import { WalletProvider } from '../context/WalletContext';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export default function RootLayout({ children }) {
  return (
    <WalletProvider>
      <html lang="en">
        <head>
          <title>VaultX</title>
        </head>
        <body>
          <ClientLayout>
            <div className="container mx-auto px-2 sm:px-4 md:px-8 max-w-screen-lg">
            {children}
            </div>
          </ClientLayout>
        </body>
      </html>
    </WalletProvider>
  );
}
