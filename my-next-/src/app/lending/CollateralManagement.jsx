import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';

export default function CollateralManagement() {
  const { contract, account } = useWallet();
  const [bitcoinAmount, setBitcoinAmount] = useState('');
  const [collateral, setCollateral] = useState('0');
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');

  useEffect(() => {
    if (contract && account) fetchCollateral();
  }, [contract, account]);

  async function fetchCollateral() {
    setLoading(true);
    try {
      const position = await contract.getBitcoinPosition(account);
      setCollateral((Number(position.totalCollateral) / 1e8).toFixed(8));
    } catch (error) {
      setCollateral('0');
    }
    setLoading(false);
  }

  async function addCollateral() {
    if (!contract || !bitcoinAmount) return;
    setLoading(true);
    setTxStatus('');
    try {
      const contractAmount = Math.floor(parseFloat(bitcoinAmount) * 1e8);
      const tx = await contract.addBitcoinCollateral(contractAmount);
      await tx.wait();
      setTxStatus('✅ Collateral added');
      setBitcoinAmount('');
      fetchCollateral();
    } catch (error) {
      setTxStatus('❌ Failed to add collateral');
    }
    setLoading(false);
  }

  async function removeCollateral() {
    if (!contract || !bitcoinAmount) return;
    setLoading(true);
    setTxStatus('');
    try {
      const contractAmount = Math.floor(parseFloat(bitcoinAmount) * 1e8);
      const tx = await contract.removeBitcoinCollateral(contractAmount);
      await tx.wait();
      setTxStatus('✅ Collateral removed');
      setBitcoinAmount('');
      fetchCollateral();
    } catch (error) {
      setTxStatus('❌ Failed to remove collateral');
    }
    setLoading(false);
  }

  return (
    <div className="bg-black/40 p-6 rounded-xl shadow border border-white/10 mb-8 max-w-4xl mx-auto min-h-[350px] flex flex-col justify-center">
      <h2 className="text-2xl font-semibold mb-4 text-yellow-300 flex items-center gap-2 ">💰 Bitcoin Collateral Management</h2>
      <div className="mb-4 text-lg text-white">Current Collateral: <span className="font-mono">{collateral} BTC</span></div>
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          placeholder="Bitcoin amount (e.g., 1.5 for 1.5 BTC)"
          value={bitcoinAmount}
          onChange={e => setBitcoinAmount(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button
          onClick={addCollateral}
          disabled={loading || !bitcoinAmount}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-700"
        >Add Collateral</button>
        <button
          onClick={removeCollateral}
          disabled={loading || !bitcoinAmount}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-700"
        >Remove Collateral</button>
      </div>
      {txStatus && <div className="mt-2 text-base text-center text-yellow-200">{txStatus}</div>}
    </div>
  );
} 