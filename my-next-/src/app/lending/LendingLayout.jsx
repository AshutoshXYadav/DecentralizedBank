import { useState } from 'react';
import CollateralManagement from './CollateralManagement';
import MakeLoan from './MakeLoan';
import LendingHistoryAndRepay from './LendingHistoryAndRepay';

const sections = [
  { id: 'collateral', label: 'Collateral', icon: '💰' },
  { id: 'make-loan', label: 'Make Loan', icon: '📝' },
  { id: 'history', label: 'History & Repay', icon: '📜' },
];

export default function LendingLayout() {
  const [active, setActive] = useState('collateral');

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
      <main className="flex-1 p-8">
        {active === 'collateral' && <CollateralManagement />}
        {active === 'make-loan' && <MakeLoan />}
        {active === 'history' && <LendingHistoryAndRepay />}
      </main>
    </div>
  );
} 