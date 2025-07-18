import '../styles/global.css';
import { Geist, Geist_Mono } from 'next/font/google';
import ClientLayout from '../components/ClientLayout';
import Navbar from '../components/Navbar';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>VaultX</title>
      </head>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
