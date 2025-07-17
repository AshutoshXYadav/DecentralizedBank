'use client';

import { useState } from 'react';
import CreateScheduledPayment from '../../components/CreateScheduledPayment';
import ScheduledPaymentsList from '../../components/ScheduledPaymentsList';
import ExecuteReadyPayments from '../../components/ExecuteReadyPayments';
import AutomationStatus from '../../components/AutomationStatus';
import TestAutomation from '../../components/TestAutomation';

const sections = [
  { id: 'create', label: 'Create Payment', icon: '➕', component: CreateScheduledPayment },
  { id: 'manage', label: 'Manage Payments', icon: '📋', component: ScheduledPaymentsList },
  { id: 'execute', label: 'Execute Ready', icon: '⚡', component: ExecuteReadyPayments },
  { id: 'automation', label: 'Automation Status', icon: '🤖', component: AutomationStatus },
  { id: 'test', label: 'Test Automation', icon: '🧪', component: TestAutomation },
];

export default function ScheduledPage() {
  const [active, setActive] = useState('create');
  const userAddress = ""; // Set this to the connected wallet address if needed
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePaymentCreated = () => setRefreshKey(prev => prev + 1);
  const handlePaymentUpdated = () => setRefreshKey(prev => prev + 1);

  const ActiveComponent = sections.find(sec => sec.id === active)?.component;

  return (
    <div className="flex min-h-screen bg-[#181c27]">
      {/* Sidebar */}
      <nav className="w-64 bg-[#23263a] p-6 flex flex-col gap-4 shadow-lg">
        <h2 className="text-2xl font-bold text-blue-300 mb-8">VaultX</h2>
        {sections.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActive(sec.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-semibold transition ${
              active === sec.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow'
                : 'text-gray-300 hover:bg-[#1a1d2b]'
            }`}
          >
            <span>{sec.icon}</span> {sec.label}
          </button>
        ))}
      </nav>
      {/* Main Content */}
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="bg-black/40 p-6 rounded-xl shadow border border-white/10 mb-8 max-w-4xl mx-auto min-h-[450px] flex flex-col justify-center w-full">
          {ActiveComponent && (
            <ActiveComponent
              key={refreshKey}
              userAddress={userAddress}
              onPaymentCreated={handlePaymentCreated}
              onPaymentUpdated={handlePaymentUpdated}
              onPaymentsExecuted={handlePaymentUpdated}
            />
          )}
        </div>
      </main>
    </div>
  );
} 