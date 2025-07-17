'use client';

import { useState, useEffect } from 'react';

export default function AutomationStatus({ userAddress }) {
  const [automationStatus, setAutomationStatus] = useState({
    isRegistered: false,
    lastCheck: null,
    readyPayments: 0,
    totalPayments: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const checkAutomationStatus = async () => {
    setLoading(true);
    try {
      // Check if any payments are ready for automation
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
        setAutomationStatus(prev => ({
          ...prev,
          readyPayments: result.readyPayments.length,
          lastCheck: new Date().toLocaleString()
        }));
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
      // This simulates what Chainlink Keepers would do
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
      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        checkAutomationStatus(); // Refresh status
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
    checkAutomationStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkAutomationStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#23263a] to-[#181c27] p-8 rounded-2xl shadow-2xl border border-pink-700 max-w-2xl mx-auto min-h-[200px] flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🤖</span>
        <h2 className="text-2xl font-extrabold text-pink-200 tracking-tight drop-shadow">Automation Status</h2>
      </div>
      <p className="text-gray-400 mb-6">Check the status of blockchain automation for your scheduled payments.</p>
      
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">🔗 Chainlink Keepers</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-medium ${automationStatus.isRegistered ? 'text-green-600' : 'text-orange-600'}`}>
                {automationStatus.isRegistered ? '✅ Registered' : '⚠️ Not Registered'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Ready Payments:</span>
              <span className="font-medium">{automationStatus.readyPayments}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Check:</span>
              <span className="font-medium">{automationStatus.lastCheck || 'Never'}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">⚡ Automation Features</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span>Automatic payment execution</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span>Real-time monitoring</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span>Gas-optimized execution</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span>Decentralized automation</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={checkAutomationStatus}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Checking...' : 'Check Status'}
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
          <h3 className="font-semibold text-yellow-800 mb-2">📋 How True Automation Works</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>1. <strong>Chainlink Keepers</strong> monitor your contract every minute</p>
            <p>2. When payments are due, they automatically execute them</p>
            <p>3. No manual intervention required - truly automated!</p>
            <p>4. Gas costs are covered by the keeper network</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">🔧 Registration Steps</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>1. Deploy contract to Sepolia/Mainnet</p>
            <p>2. Go to <a href="https://keepers.chain.link" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">keepers.chain.link</a></p>
            <p>3. Register your contract as an "Upkeep"</p>
            <p>4. Fund with LINK tokens for gas costs</p>
            <p>5. Automation starts immediately!</p>
          </div>
        </div>
      </div>
    </div>
  );
} 