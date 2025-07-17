'use client';

import { useState } from 'react';
import { FREQUENCIES } from '../utils/frequency';

export default function TestAutomation({ userAddress }) {
  const [testData, setTestData] = useState({
    recipient: '',
    amount: '0.001',
    frequency: FREQUENCIES.DAILY,
    description: 'Test automation payment'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createTestPayment = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/blockchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createScheduledPayment',
          recipient: testData.recipient,
          amount: testData.amount,
          frequency: testData.frequency,
          totalPayments: 3, // Only 3 payments for testing
          description: testData.description
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        setTestData(prev => ({ ...prev, recipient: '' }));
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAutomation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/blockchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'testAutomation'
        }),
      });

      const result = await response.json();
      setMessage(`ℹ️ ${result.message}`);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#23263a] to-[#181c27] p-8 rounded-2xl shadow-2xl border border-yellow-700 max-w-2xl mx-auto min-h-[200px] flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🧪</span>
        <h2 className="text-2xl font-extrabold text-yellow-200 tracking-tight drop-shadow">Test Automation</h2>
      </div>
      <p className="text-gray-400 mb-6">Test the automation of your scheduled payments.</p>
      
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('✅') ? 'bg-green-100 text-green-700' : 
          message.includes('ℹ️') ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Recipient Address
          </label>
          <input
            type="text"
            value={testData.recipient}
            onChange={(e) => setTestData(prev => ({ ...prev, recipient: e.target.value }))}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (ETH)
            </label>
            <input
              type="number"
              value={testData.amount}
              onChange={(e) => setTestData(prev => ({ ...prev, amount: e.target.value }))}
              step="0.001"
              min="0.001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              value={testData.frequency}
              onChange={(e) => setTestData(prev => ({ ...prev, frequency: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={FREQUENCIES.DAILY}>Daily</option>
              <option value={FREQUENCIES.WEEKLY}>Weekly</option>
              <option value={FREQUENCIES.MONTHLY}>Monthly</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={createTestPayment}
            disabled={loading || !testData.recipient}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Test Payment'}
          </button>
          
          <button
            onClick={testAutomation}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Automation'}
          </button>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 Test Instructions</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>1. Enter a recipient address (can be your own)</p>
            <p>2. Set a small amount (0.001 ETH recommended)</p>
            <p>3. Choose frequency (Daily for quick testing)</p>
            <p>4. Create the test payment</p>
            <p>5. Wait for Chainlink Keepers to execute it automatically</p>
            <p>6. Check the "Manage Payments" tab to see status</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">🔗 Chainlink Keepers Status</h3>
          <div className="text-sm text-blue-700">
            <p><strong>Contract Address:</strong> 0x118745182A6a240905c936f778cda112321753C1</p>
            <p><strong>Network:</strong> Sepolia Testnet</p>
            <p><strong>Registration URL:</strong> <a href="https://keepers.chain.link/sepolia" target="_blank" rel="noopener noreferrer" className="underline">keepers.chain.link/sepolia</a></p>
          </div>
        </div>
      </div>
    </div>
  );
} 