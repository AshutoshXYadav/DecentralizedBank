import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { formatEther, parseEther } from 'ethers';

export default function MakeLoan() {
  const { contract, account } = useWallet();
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDuration, setLoanDuration] = useState('30');
  const [bitcoinCollateral, setBitcoinCollateral] = useState('');
  const [collateral, setCollateral] = useState('0');
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');

  useEffect(() => {
    if (contract && account) fetchCollateral();
  }, [contract, account]);

  async function fetchCollateral() {
    try {
      const position = await contract.getBitcoinPosition(account);
      setCollateral((Number(position.totalCollateral) / 1e8).toFixed(8));
    } catch (error) {
      setCollateral('0');
    }
  }

  async function createLoan() {
    if (!contract || !loanAmount || !loanDuration || !bitcoinCollateral) return;
    setLoading(true);
    setTxStatus('');
    try {
      const contractCollateral = Math.floor(parseFloat(bitcoinCollateral) * 1e8);
      const tx = await contract.createLoan(
        contractCollateral,
        parseEther(loanAmount),
        loanDuration
      );
      await tx.wait();
      setTxStatus('✅ Loan created successfully');
      setLoanAmount('');
      setLoanDuration('30');
      setBitcoinCollateral('');
      fetchCollateral();
    } catch (error) {
      setTxStatus('❌ Failed to create loan');
    }
    setLoading(false);
  }

  return (
    <div className="bg-black/40 p-6 rounded-xl shadow border border-white/10 mb-8 max-w-4xl mx-auto min-h-[450px] flex flex-col justify-center">
      <h2 className="text-2xl font-semibold mb-4 text-blue-300 flex items-center gap-2">📝 Create Bitcoin-Backed Loan</h2>
      <div className="mb-2 text-white">Current Collateral: <span className="font-mono">{collateral} BTC</span></div>
      <div className="mb-2 text-gray-300 text-sm">Minimum collateral ratio: <span className="font-bold">200%</span> | Interest rate: <span className="font-bold">5% APR</span> | Liquidation threshold: <span className="font-bold">150%</span></div>
      <div className="flex flex-col gap-3 mb-4">
        <input
          type="number"
          placeholder="Loan amount (ETH)"
          value={loanAmount}
          onChange={e => setLoanAmount(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          placeholder="Bitcoin collateral (e.g., 0.5 for 0.5 BTC)"
          value={bitcoinCollateral}
          onChange={e => setBitcoinCollateral(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={loanDuration}
          onChange={e => setLoanDuration(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="7">7 days</option>
          <option value="30">30 days</option>
          <option value="90">90 days</option>
          <option value="180">180 days</option>
          <option value="365">365 days</option>
        </select>
        <button
          onClick={createLoan}
          disabled={loading || !loanAmount || !bitcoinCollateral}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 text-lg font-semibold shadow disabled:bg-gray-700"
        >Create Loan</button>
      </div>
      {txStatus && <div className="mt-2 text-base text-center text-blue-200">{txStatus}</div>}
    </div>
  );
} 