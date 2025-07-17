'use client';

import React, { useState } from 'react';
import CreateScheduledPayment from './CreateScheduledPayment';
import ScheduledPaymentsList from './ScheduledPaymentsList';
import ExecuteReadyPayments from './ExecuteReadyPayments';
import AutomationStatus from './AutomationStatus';
import TestAutomation from './TestAutomation';

export default function ScheduledPaymentsDashboard({ userAddress }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePaymentCreated = () => setRefreshKey(prev => prev + 1);
  const handlePaymentUpdated = () => setRefreshKey(prev => prev + 1);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Scheduled Payments</h1>
        <p className="text-gray-600">Create, manage, and automate recurring payments with true blockchain automation</p>
      </div>

      {/* Create Scheduled Payment */}
      <div className="bg-black/40 p-6 rounded-xl shadow border border-white/10 mb-8 max-w-4xl mx-auto min-h-[350px] flex flex-col justify-center">
        <CreateScheduledPayment onPaymentCreated={handlePaymentCreated} />
      </div>

      {/* Manage Payments */}
      <div className="bg-black/40 p-6 rounded-xl shadow border border-white/10 mb-8 max-w-4xl mx-auto min-h-[350px] flex flex-col justify-center">
        <ScheduledPaymentsList userAddress={userAddress} onPaymentUpdated={handlePaymentUpdated} />
      </div>

      {/* Execute Ready Payments */}
      <div className="bg-black/40 p-6 rounded-xl shadow border border-white/10 mb-8 max-w-4xl mx-auto min-h-[350px] flex flex-col justify-center">
        <ExecuteReadyPayments onPaymentsExecuted={handlePaymentUpdated} />
      </div>

      {/* Automation Status */}
      <div className="bg-black/40 p-6 rounded-xl shadow border border-white/10 mb-8 max-w-4xl mx-auto min-h-[200px] flex flex-col justify-center">
        <AutomationStatus />
      </div>

      {/* Test Automation */}
      <div className="bg-black/40 p-6 rounded-xl shadow border border-white/10 mb-8 max-w-4xl mx-auto min-h-[200px] flex flex-col justify-center">
        <TestAutomation userAddress={userAddress} />
      </div>
    </div>
  );
} 