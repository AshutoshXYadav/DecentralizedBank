'use client';

import { useState } from 'react';
import { FREQUENCY_OPTIONS } from '../utils/frequency';

export default function CreateScheduledPayment({ onPaymentCreated }) {
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    frequency: 86400, // Daily by default
    totalPayments: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate totalPayments is a positive number, zero, or blank
    const totalPaymentsValue = formData.totalPayments.trim();
    if (
      totalPaymentsValue !== "" &&
      (isNaN(totalPaymentsValue) || Number(totalPaymentsValue) < 0)
    ) {
      setMessage("❌ Total Payments must be a positive number or 0 for unlimited.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/blockchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createScheduledPayment',
          ...formData,
          totalPayments: formData.totalPayments || 0
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        setFormData({
          recipient: '',
          amount: '',
          frequency: 86400,
          totalPayments: '',
          description: ''
        });
        if (onPaymentCreated) {
          onPaymentCreated();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-gradient-to-br from-[#23263a] to-[#181c27] p-8 rounded-2xl shadow-2xl border border-blue-700 max-w-2xl mx-auto min-h-[400px] flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">➕</span>
        <h2 className="text-3xl font-extrabold text-blue-200 tracking-tight drop-shadow">Create Scheduled Payment</h2>
      </div>
      <p className="text-gray-400 mb-6">Set up a recurring payment with blockchain automation.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-base font-semibold text-purple-200 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            placeholder="0x..."
            required
            className="w-full px-4 py-3 bg-gray-800 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400 text-lg"
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-purple-200 mb-2">
            Amount (ETH)
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.1"
            step="0.001"
            min="0.001"
            required
            className="w-full px-4 py-3 bg-gray-800 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400 text-lg"
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-purple-200 mb-2">
            Frequency
          </label>
          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-gray-800 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-lg"
          >
            {FREQUENCY_OPTIONS.map(option => (
              <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-base font-semibold text-purple-200 mb-2">
            Total Payments <span className="text-xs text-gray-400">(0 for unlimited)</span>
          </label>
          <input
            type="text"
            inputMode="decimal"
            name="totalPayments"
            value={formData.totalPayments}
            onChange={handleChange}
            placeholder="12"
            className="w-full px-4 py-3 bg-gray-800 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400 text-lg"
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-purple-200 mb-2">
            Description <span className="text-xs text-gray-400">(Optional)</span>
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Rent payment, Subscription, etc."
            className="w-full px-4 py-3 bg-gray-800 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400 text-lg"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          {loading ? 'Creating...' : 'Create Scheduled Payment'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('✅') ? 'bg-green-900 text-green-300 border border-green-600' : 'bg-red-900 text-red-300 border border-red-600'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
} 