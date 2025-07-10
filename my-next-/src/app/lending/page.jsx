'use client';
import { useState, useEffect } from 'react';
import { useWallet } from "@/context/WalletContext";
import { formatEther, parseEther } from "ethers";

export default function LendingPage() {
  const { contract, account, connectWallet, connecting } = useWallet();
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  
  // Bitcoin collateral state
  const [bitcoinAmount, setBitcoinAmount] = useState("");
  const [bitcoinPosition, setBitcoinPosition] = useState(null);
  
  // Loan state
  const [loanAmount, setLoanAmount] = useState("");
  const [loanDuration, setLoanDuration] = useState("30");
  const [loanBitcoinCollateral, setLoanBitcoinCollateral] = useState("");
  const [userLoans, setUserLoans] = useState([]);
  const [totalLoans, setTotalLoans] = useState(0);
  const [totalBitcoinCollateral, setTotalBitcoinCollateral] = useState(0);

  useEffect(() => {
    if (contract && account) {
      fetchBitcoinPosition();
      fetchUserLoans();
      fetchGlobalStats();
    }
  }, [contract, account]);

  async function fetchBitcoinPosition() {
    if (!contract || !account) return;
    try {
      const position = await contract.getBitcoinPosition(account);
      setBitcoinPosition({
        totalCollateral: position.totalCollateral.toString(),
        totalLoans: formatEther(position.totalLoans),
        liquidationThreshold: position.liquidationThreshold.toString()
      });
    } catch (error) {
      console.error("Error fetching Bitcoin position:", error);
    }
  }

  async function fetchUserLoans() {
    if (!contract || !account) return;
    try {
      const loanIds = await contract.getUserLoans(account);
      const loans = [];
      
      for (let i = 0; i < loanIds.length; i++) {
        const loan = await contract.getLoan(loanIds[i]);
        const collateralRatio = await contract.getCollateralRatio(loanIds[i]);
        
        loans.push({
          id: loan.id.toString(),
          bitcoinCollateral: loan.bitcoinCollateral.toString(),
          loanAmount: formatEther(loan.loanAmount),
          interestRate: loan.interestRate.toString(),
          startTime: new Date(Number(loan.startTime) * 1000).toLocaleDateString(),
          dueDate: new Date(Number(loan.dueDate) * 1000).toLocaleDateString(),
          isActive: loan.isActive,
          isLiquidated: loan.isLiquidated,
          collateralRatio: collateralRatio.toString()
        });
      }
      
      setUserLoans(loans);
    } catch (error) {
      console.error("Error fetching user loans:", error);
    }
  }

  async function fetchGlobalStats() {
    if (!contract) return;
    try {
      const totalLoansCount = await contract.getTotalLoans();
      const totalBTC = await contract.getTotalBitcoinCollateral();
      
      setTotalLoans(Number(totalLoansCount));
      setTotalBitcoinCollateral(Number(totalBTC));
    } catch (error) {
      console.error("Error fetching global stats:", error);
    }
  }

  async function addBitcoinCollateral() {
    if (!contract || !bitcoinAmount) return;
    setLoading(true);
    setTxStatus('');
    try {
      const tx = await contract.addBitcoinCollateral(bitcoinAmount);
      await tx.wait();
      setTxStatus('✅ Bitcoin collateral added successfully');
      setBitcoinAmount("");
      fetchBitcoinPosition();
      fetchGlobalStats();
    } catch (error) {
      setTxStatus('❌ Failed to add Bitcoin collateral');
      console.error(error);
    }
    setLoading(false);
  }

  async function removeBitcoinCollateral() {
    if (!contract || !bitcoinAmount) return;
    setLoading(true);
    setTxStatus('');
    try {
      const tx = await contract.removeBitcoinCollateral(bitcoinAmount);
      await tx.wait();
      setTxStatus('✅ Bitcoin collateral removed successfully');
      setBitcoinAmount("");
      fetchBitcoinPosition();
      fetchGlobalStats();
    } catch (error) {
      setTxStatus('❌ Failed to remove Bitcoin collateral');
      console.error(error);
    }
    setLoading(false);
  }

  async function createLoan() {
    if (!contract || !loanAmount || !loanDuration || !loanBitcoinCollateral) return;
    setLoading(true);
    setTxStatus('');
    try {
      const tx = await contract.createLoan(
        loanBitcoinCollateral, // satoshis
        parseEther(loanAmount),
        loanDuration
      );
      await tx.wait();
      setTxStatus('✅ Loan created successfully');
      setLoanAmount("");
      setLoanDuration("30");
      setLoanBitcoinCollateral("");
      fetchBitcoinPosition();
      fetchUserLoans();
      fetchGlobalStats();
    } catch (error) {
      setTxStatus('❌ Failed to create loan');
      console.error(error);
    }
    setLoading(false);
  }

  async function repayLoan(loanId) {
    if (!contract || !loanAmount) return;
    setLoading(true);
    setTxStatus('');
    try {
      const tx = await contract.repayLoan(loanId, { value: parseEther(loanAmount) });
      await tx.wait();
      setTxStatus('✅ Loan repaid successfully');
      setLoanAmount("");
      fetchBitcoinPosition();
      fetchUserLoans();
      fetchGlobalStats();
    } catch (error) {
      setTxStatus('❌ Failed to repay loan');
      console.error(error);
    }
    setLoading(false);
  }

  return (
    <main className="max-w-6xl mx-auto p-6 font-sans space-y-10 bg-[#181c27] min-h-screen">
      <h1 className="text-4xl font-bold text-center text-blue-300 bg-black/40 py-4 rounded-xl shadow mb-6 tracking-tight">🏦 Bitcoin-Backed Lending Platform</h1>
      <p className="text-center text-gray-300 mb-6">Access liquidity using your Bitcoin as collateral</p>

      {/* Connect Wallet */}
      <section className="glass-card bg-black/40 p-6 rounded-xl shadow border border-white/10 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-200">🔑 Connect Wallet</h2>
        <div className="w-full p-3 border border-white/10 rounded mb-3 bg-black/30">
          {account ? (
            <span className="text-green-400 font-mono text-lg">{account}</span>
          ) : (
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white text-lg font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
        {txStatus && (
          <p className="mt-2 text-base text-green-400 font-semibold">{txStatus}</p>
        )}
      </section>

      {/* Global Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="glass-card bg-black/40 p-6 rounded-xl shadow border border-white/10 text-center">
          <h3 className="text-xl font-semibold text-blue-200 mb-2">Total Loans</h3>
          <p className="text-3xl font-bold text-blue-100">{totalLoans}</p>
        </div>
        <div className="glass-card bg-black/40 p-6 rounded-xl shadow border border-white/10 text-center">
          <h3 className="text-xl font-semibold text-green-200 mb-2">Total Bitcoin Collateral</h3>
          <p className="text-3xl font-bold text-green-100">{totalBitcoinCollateral.toLocaleString()} sats</p>
        </div>
        <div className="glass-card bg-black/40 p-6 rounded-xl shadow border border-white/10 text-center">
          <h3 className="text-xl font-semibold text-purple-200 mb-2">Platform TVL</h3>
          <p className="text-3xl font-bold text-purple-100">${(totalBitcoinCollateral * 0.00000001 * 50000).toFixed(2)}</p>
        </div>
      </section>

      {/* Bitcoin Collateral Management */}
      <section className="glass-card bg-black/40 p-6 rounded-xl shadow border border-white/10 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-200">₿ Bitcoin Collateral Management</h2>
        {bitcoinPosition && (
          <div className="mb-4 p-4 bg-black/30 rounded-xl border border-white/10 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <span className="text-gray-200 font-semibold">Total Collateral:</span>
              <p className="font-mono text-lg text-white">{Number(bitcoinPosition.totalCollateral).toLocaleString()} sats</p>
            </div>
            <div className="flex-1">
              <span className="text-gray-200 font-semibold">Outstanding Loans:</span>
              <p className="font-mono text-lg text-white">{bitcoinPosition.totalLoans} ETH</p>
            </div>
            <div className="flex-1">
              <span className="text-gray-200 font-semibold">Collateral Ratio:</span>
              <p className="font-mono text-lg text-white">
                {bitcoinPosition.totalLoans > 0 
                  ? `${((Number(bitcoinPosition.totalCollateral) * 0.00000001 * 50000) / Number(bitcoinPosition.totalLoans) * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-4 mb-3">
          <input
            type="number"
            placeholder="Bitcoin amount (satoshis)"
            value={bitcoinAmount}
            onChange={(e) => setBitcoinAmount(e.target.value)}
            className="flex-1 p-3 border border-white/10 rounded-xl text-lg bg-black/30 text-white placeholder-gray-400"
          />
          <button
            onClick={addBitcoinCollateral}
            disabled={loading || !bitcoinAmount}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 text-lg font-semibold shadow disabled:bg-gray-700"
          >
            Add Collateral
          </button>
          <button
            onClick={removeBitcoinCollateral}
            disabled={loading || !bitcoinAmount}
            className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 text-lg font-semibold shadow disabled:bg-gray-700"
          >
            Remove Collateral
          </button>
        </div>
      </section>

      {/* Create Loan */}
      <section className="glass-card bg-black/40 p-6 rounded-xl shadow border border-white/10 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-200">💸 Create Bitcoin-Backed Loan</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          <input
            type="number"
            placeholder="Loan amount (ETH)"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="p-3 border border-white/10 rounded-xl text-lg bg-black/30 text-white placeholder-gray-400"
          />
          <input
            type="number"
            placeholder="Bitcoin collateral (satoshis)"
            value={loanBitcoinCollateral}
            onChange={(e) => setLoanBitcoinCollateral(e.target.value)}
            className="p-3 border border-white/10 rounded-xl text-lg bg-black/30 text-white placeholder-gray-400"
          />
          <select
            value={loanDuration}
            onChange={(e) => setLoanDuration(e.target.value)}
            className="p-3 border border-white/10 rounded-xl text-lg bg-black/30 text-white"
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="180">180 days</option>
            <option value="365">365 days</option>
          </select>
          <button
            onClick={createLoan}
            disabled={loading || !loanAmount || !loanBitcoinCollateral}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 text-lg font-semibold shadow disabled:bg-gray-700"
          >
            Create Loan
          </button>
        </div>
        <p className="text-base text-gray-300">
          Minimum collateral ratio: <span className="font-bold text-white">200%</span> | Interest rate: <span className="font-bold text-white">5% APR</span> | Liquidation threshold: <span className="font-bold text-white">150%</span>
        </p>
      </section>

      {/* User Loans */}
      <section className="glass-card bg-black/40 p-6 rounded-xl shadow border border-white/10 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-purple-200">📋 Your Loans</h2>
        {userLoans.length === 0 ? (
          <p className="text-gray-400 text-lg">No loans yet</p>
        ) : (
          <div className="space-y-4">
            {userLoans.map((loan) => (
              <div key={loan.id} className="bg-black/30 p-4 rounded-xl border border-white/10 shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-white">Loan #{loan.id}</h3>
                  <p className="text-sm text-gray-200">
                    {loan.loanAmount} ETH borrowed | {loan.bitcoinCollateral} sats collateral
                  </p>
                  <p className="text-sm text-gray-200">
                    Due: {loan.dueDate} | Collateral Ratio: {loan.collateralRatio}%
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-xl text-base font-medium ${
                  loan.isLiquidated ? 'bg-red-900 text-red-200' :
                  loan.isActive ? 'bg-green-900 text-green-200' :
                  'bg-gray-800 text-gray-200'
                }`}>
                  {loan.isLiquidated ? 'Liquidated' : loan.isActive ? 'Active' : 'Repaid'}
                </span>
                {loan.isActive && (
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <input
                      type="number"
                      placeholder="Repayment amount (ETH)"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      className="flex-1 p-2 border border-white/10 rounded-xl text-base bg-black/30 text-white placeholder-gray-400"
                    />
                    <button
                      onClick={() => repayLoan(loan.id)}
                      disabled={loading || !loanAmount}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl text-base hover:bg-green-700 disabled:bg-gray-700"
                    >
                      Repay
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      
      
    </main>
  );
} 