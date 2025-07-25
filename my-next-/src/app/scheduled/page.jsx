'use client';

import { useState } from 'react';
import CreateScheduledPayment from '../../components/CreateScheduledPayment';
import ScheduledPaymentsList from '../../components/ScheduledPaymentsList';
import ExecuteReadyPayments from '../../components/ExecuteReadyPayments';
import AutomationStatus from '../../components/AutomationStatus';
import TestAutomation from '../../components/TestAutomation';
import { useWallet } from '../../context/WalletContext'; // adjust path if needed

const sections = [
  { id: 'create', label: 'Create Payment', icon: '➕', component: CreateScheduledPayment },
  { id: 'manage', label: 'Manage Payments', icon: '📋', component: ScheduledPaymentsList },
  { id: 'execute', label: 'Execute Ready', icon: '⚡', component: ExecuteReadyPayments },
  { id: 'automation', label: 'Automation Status', icon: '🤖', component: AutomationStatus },
  { id: 'test', label: 'Test Automation', icon: '🧪', component: TestAutomation },
];

export default function ScheduledPage() {
  const { account: userAddress } = useWallet(); // Get the connected wallet address
  const [active, setActive] = useState('create');
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handlePaymentCreated = () => setRefreshKey(prev => prev + 1);
  const handlePaymentUpdated = () => setRefreshKey(prev => prev + 1);

  const ActiveComponent = sections.find(sec => sec.id === active)?.component;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#181c27]">
      {/* Sidebar */}
      <button
        className="md:hidden p-4 text-blue-300 focus:outline-none"
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label="Toggle sidebar"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
      </button>
      <nav className={`bg-[#23263a] p-6 flex flex-col gap-4 shadow-lg w-full md:w-64 z-10 md:static fixed top-0 left-0 h-full md:h-auto transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} style={{maxWidth:'16rem'}}>
        <h2 className="text-2xl font-bold text-blue-300 mb-8">VaultX</h2>
        {sections.map(sec => (
          <button
            key={sec.id}
            onClick={() => { setActive(sec.id); setSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base md:text-lg font-semibold transition ${
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
      <main className="flex-1 p-4 sm:p-6 md:p-8 mt-16 md:mt-0 flex flex-col items-center justify-center">
        <div className="bg-black/40 p-4 sm:p-6 rounded-xl shadow border border-white/10 mb-8 max-w-4xl mx-auto min-h-[450px] flex flex-col justify-center w-full">
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