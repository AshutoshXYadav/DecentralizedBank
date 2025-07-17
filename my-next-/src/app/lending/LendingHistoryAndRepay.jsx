import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { formatEther } from 'ethers';

export default function LendingHistoryAndRepay() {
  const { contract, account } = useWallet();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');

  useEffect(() => {
    if (contract && account) fetchLoans();
  }, [contract, account]);

  async function fetchLoans() {
    setLoading(true);
    try {
      const loanIds = await contract.getUserLoans(account);
      const fetchedLoans = [];
      for (let i = 0; i < loanIds.length; i++) {
        const loan = await contract.getLoan(loanIds[i]);
        let repaymentAmount = '0';
        if (loan.isActive) {
          try {
            const totalRepayment = await contract.getRepaymentAmount(loanIds[i]);
            repaymentAmount = formatEther(totalRepayment);
          } catch {}
        }
        fetchedLoans.push({
          id: loan.id.toString(),
          bitcoinCollateral: loan.bitcoinCollateral.toString(),
          loanAmount: formatEther(loan.loanAmount),
          interestRate: loan.interestRate.toString(),
          startTime: new Date(Number(loan.startTime) * 1000).toLocaleDateString(),
          dueDate: new Date(Number(loan.dueDate) * 1000).toLocaleDateString(),
          isActive: loan.isActive,
          isLiquidated: loan.isLiquidated,
          repaymentAmount,
        });
      }
      setLoans(fetchedLoans);
    } catch (error) {
      setLoans([]);
    }
    setLoading(false);
  }

  async function repayLoan(loanId) {
    if (!contract) return;
    setLoading(true);
    setTxStatus('');
    try {
      const totalRepayment = await contract.getRepaymentAmount(loanId);
      const buffer = 1000000000000000n; // 0.001 ETH buffer
      const tx = await contract.repayLoan(loanId, { value: totalRepayment + buffer });
      await tx.wait();
      setTxStatus('✅ Loan repaid successfully');
      fetchLoans();
    } catch (error) {
      setTxStatus('❌ Failed to repay loan');
    }
    setLoading(false);
  }

  return (
    <div className="bg-black/40 p-9 rounded-xl shadow border border-white/10 mb-8 max-w-70xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-purple-300 flex items-center gap-2">📜 Lending History & Repay</h2>
      {loading ? <div className="text-white">Loading...</div> : null}
      {txStatus && <div className="mb-2 text-base text-center text-purple-200">{txStatus}</div>}
      {loans.length === 0 ? (
        <div className="text-gray-400">No loans found.</div>
      ) : (
        <div className="space-y-4">
          {loans.map(loan => (
            <div key={loan.id} className="bg-black/30 p-4 rounded-xl border border-white/10 shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg text-white">Loan #{loan.id}</h3>
                <p className="text-sm text-gray-200">
                  {loan.loanAmount} ETH borrowed | {(Number(loan.bitcoinCollateral) / 1e8).toFixed(8)} BTC collateral
                </p>
                <p className="text-sm text-gray-200">
                  Due: {loan.dueDate} | Interest Rate: {loan.interestRate / 100}% APR
                </p>
                {loan.isActive && (
                  <p className="text-sm text-yellow-200 font-semibold">
                    Repayment Required: {loan.repaymentAmount} ETH (includes interest)
                  </p>
                )}
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
                  <button
                    onClick={() => repayLoan(loan.id)}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-base hover:bg-green-700 disabled:bg-gray-700"
                  >
                    Repay {loan.repaymentAmount} ETH
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 