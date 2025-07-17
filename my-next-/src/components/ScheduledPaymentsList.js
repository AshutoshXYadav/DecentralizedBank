'use client';

import { useState, useEffect } from 'react';
import { getFrequencyLabel, formatNextPaymentTime, isPaymentOverdue } from '../utils/frequency';

export default function ScheduledPaymentsList({ userAddress, onPaymentUpdated }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/blockchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getUserScheduledPayments',
          address: userAddress
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setPayments(result.payments);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userAddress) {
      fetchPayments();
    }
  }, [userAddress]);

  const handleExecutePayment = async (paymentId) => {
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
        fetchPayments(); // Refresh the list
        if (onPaymentUpdated) {
          onPaymentUpdated();
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

  const handleCancelPayment = async (paymentId) => {
    if (!confirm('Are you sure you want to cancel this scheduled payment?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/blockchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancelScheduledPayment',
          paymentId: paymentId
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        fetchPayments(); // Refresh the list
        if (onPaymentUpdated) {
          onPaymentUpdated();
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

  const handleUpdatePayment = async (paymentId, newAmount, newFrequency) => {
    setLoading(true);
    try {
      const response = await fetch('/api/blockchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateScheduledPayment',
          paymentId: paymentId,
          newAmount: newAmount,
          newFrequency: newFrequency
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        fetchPayments(); // Refresh the list
        if (onPaymentUpdated) {
          onPaymentUpdated();
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

  if (loading && payments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Scheduled Payments</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#23263a] to-[#181c27] p-8 rounded-2xl shadow-2xl border border-purple-700 max-w-4xl mx-auto min-h-[400px] flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📋</span>
        <h2 className="text-2xl font-extrabold text-purple-200 tracking-tight drop-shadow">Manage Scheduled Payments</h2>
      </div>
      <p className="text-gray-400 mb-6">View, update, or cancel your scheduled payments.</p>
      
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {payments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No scheduled payments found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className={`border rounded-lg p-4 ${
                !payment.isActive ? 'bg-gray-50 border-gray-200' : 
                isPaymentOverdue(payment.nextPaymentTime) ? 'bg-red-50 border-red-200' : 
                'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Payment #{payment.id}
                    {!payment.isActive && <span className="ml-2 text-sm text-gray-500">(Cancelled)</span>}
                  </h3>
                  <p className="text-sm text-gray-600">
                    To: {payment.recipient.slice(0, 6)}...{payment.recipient.slice(-4)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">{payment.amount} ETH</p>
                  <p className="text-sm text-gray-600">{getFrequencyLabel(payment.frequency)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <span className="text-gray-600">Next Payment:</span>
                  <p className={`font-medium ${
                    isPaymentOverdue(payment.nextPaymentTime) ? 'text-red-600' : 'text-gray-800'
                  }`}>
                    {formatNextPaymentTime(payment.nextPaymentTime)}
                    {isPaymentOverdue(payment.nextPaymentTime) && payment.isActive && (
                      <span className="ml-2 text-red-600 font-bold">OVERDUE</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Progress:</span>
                  <p className="font-medium">
                    {payment.paymentsMade} / {payment.totalPayments === '0' ? '∞' : payment.totalPayments}
                  </p>
                </div>
              </div>

              {payment.description && (
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Description:</span> {payment.description}
                </p>
              )}

              {payment.isActive && (
                <div className="flex gap-2">
                  {isPaymentOverdue(payment.nextPaymentTime) && (
                    <button
                      onClick={() => handleExecutePayment(payment.id)}
                      disabled={loading}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                    >
                      Execute Now
                    </button>
                  )}
                  <button
                    onClick={() => handleCancelPayment(payment.id)}
                    disabled={loading}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <UpdatePaymentModal
                    payment={payment}
                    onUpdate={(newAmount, newFrequency) => 
                      handleUpdatePayment(payment.id, newAmount, newFrequency)
                    }
                    disabled={loading}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Update Payment Modal Component
function UpdatePaymentModal({ payment, onUpdate, disabled }) {
  const [showModal, setShowModal] = useState(false);
  const [newAmount, setNewAmount] = useState(payment.amount);
  const [newFrequency, setNewFrequency] = useState(payment.frequency);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(newAmount, newFrequency);
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={disabled}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
      >
        Update
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Scheduled Payment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Amount (ETH)
                </label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  step="0.001"
                  min="0.001"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Frequency (seconds)
                </label>
                <input
                  type="number"
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  min="3600"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 