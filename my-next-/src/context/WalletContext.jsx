'use client';
import { createContext, useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import { getBankContract } from "../utils/contract";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connecting, setConnecting] = useState(false);

  async function connectWallet() {
    if (connecting) return; // Prevent multiple calls
    if (typeof window.ethereum !== 'undefined') {
      try {
        setConnecting(true);
        const [selectedAccount] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(selectedAccount);

        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        const signer = await browserProvider.getSigner();
        setSigner(signer);
        const bankContract = getBankContract(signer);
        setContract(bankContract);
      } catch (err) {
        if (err?.code === -32002) {
          alert("A wallet connection request is already pending. Please check your wallet extension.");
        } else {
          alert('Failed to connect wallet: ' + (err?.message || JSON.stringify(err)));
        }
        console.error("Wallet connection error:", err, err?.message, err?.stack);
      }
      setConnecting(false);
    } else {
      alert('Please install MetaMask!');
    }
  }

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = async (accounts) => {
        setAccount(accounts[0]);
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await browserProvider.getSigner();
        setSigner(newSigner);
        setContract(getBankContract(newSigner));
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  // Update signer whenever provider or account changes
  useEffect(() => {
    async function updateSigner() {
      if (provider && account) {
        const newSigner = await provider.getSigner();
        setSigner(newSigner);
      }
    }
    updateSigner();
  }, [provider, account]);

  return (
    <WalletContext.Provider value={{ account, connectWallet, contract, provider, signer, connecting }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}     