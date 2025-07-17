'use client';

import { useState, useEffect } from 'react';
import { getFrequencyLabel, formatNextPaymentTime } from '../utils/frequency';

export default function ExecuteReadyPayments({ onPaymentsExecuted }) {
  const [readyPayments, setReadyPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchReadyPayments = async () => {
    try {
      const response = await fetch('/api/blockchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getReadyScheduledPayments'
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setReadyPayments(result.readyPayments);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchReadyPayments();
    // Refresh every 30 seconds
    const interval = setInterval(fetchReadyPayments, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleExecuteAll = async () => {
    if (!confirm(`Execute all ${readyPayments.length} ready payments?`)) {
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const payment of readyPayments) {
      try {
        const response = await fetch('/api/blockchain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'executeScheduledPayment',
            paymentId: payment.id
          }),
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    setMessage(`✅ Executed ${successCount} payments${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
    fetchReadyPayments(); // Refresh the list
    if (onPaymentsExecuted) {
      onPaymentsExecuted();
    }
    setLoading(false);
  };

  const handleExecuteSingle = async (paymentId) => {
    setLoading(true);
    try {
      const response = await fetch('/api/blockchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'executeScheduledPayment',
          paymentId: paymentId
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        fetchReadyPayments(); // Refresh the list
        if (onPaymentsExecuted) {
          onPaymentsExecuted();
        }
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (readyPayments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Ready Payments</h2>
        <div className="text-center py-8">
          <p className="text-gray-600">No payments ready for execution.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#23263a] to-[#181c27] p-8 rounded-2xl shadow-2xl border border-green-700 max-w-4xl mx-auto min-h-[400px] flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">⚡</span>
        <h2 className="text-2xl font-extrabold text-green-200 tracking-tight drop-shadow">Execute Ready Payments</h2>
      </div>
      <p className="text-gray-400 mb-6">Execute all payments that are ready for processing.</p>

      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('✅') ? 'bg-green-900 text-green-300 border border-green-600' : 'bg-red-900 text-red-300 border border-red-600'
        }`}>
          {message}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleExecuteAll}
          disabled={loading || readyPayments.length === 0}
          className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 text-lg font-semibold shadow disabled:bg-gray-700"
        >
          {loading ? 'Executing...' : `Execute All (${readyPayments.length})`}
        </button>
      </div>

      <div className="space-y-3">
        {readyPayments.map((payment) => (
          <div
            key={payment.id}
            className="border border-green-200 bg-green-50/10 rounded-lg p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-green-200">
                  Payment #{payment.id}
                </h3>
                <p className="text-sm text-gray-300">
                  From: {payment.sender.slice(0, 6)}...{payment.sender.slice(-4)}
                </p>
                <p className="text-sm text-gray-300">
                  To: {payment.recipient.slice(0, 6)}...{payment.recipient.slice(-4)}
                </p>
                <p className="text-sm text-gray-300">
                  Frequency: {getFrequencyLabel(payment.frequency)}
                </p>
                <p className="text-sm text-gray-300">
                  Next Payment: {formatNextPaymentTime(payment.nextPaymentTime)}
                </p>
                {payment.description && (
                  <p className="text-sm text-gray-300">
                    Description: {payment.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg text-green-300">{payment.amount} ETH</p>
                <button
                  onClick={() => handleExecuteSingle(payment.id)}
                  disabled={loading}
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                >
                  Execute
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}