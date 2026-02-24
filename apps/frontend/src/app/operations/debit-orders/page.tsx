'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';

type TabType = 'overview' | 'groups' | 'members' | 'transactions' | 'failed-payments' | 'refunds' | 'reconciliation' | 'webhooks' | 'reports' | 'batches';

export default function DebitOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Debit Order Management</h1>
          <p className="text-gray-600 mt-2">Comprehensive debit order processing and group management</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-1 min-w-max">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'groups', label: 'Groups', icon: '👥' },
              { id: 'members', label: 'Members', icon: '👤' },
              { id: 'transactions', label: 'Transactions', icon: '💳' },
              { id: 'failed-payments', label: 'Failed', icon: '⚠️' },
              { id: 'refunds', label: 'Refunds', icon: '💸' },
              { id: 'reconciliation', label: 'Reconcile', icon: '🔄' },
              { id: 'webhooks', label: 'Webhooks', icon: '📡' },
              { id: 'reports', label: 'Reports', icon: '📈' },
              { id: 'batches', label: 'Batches', icon: '📋' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs transition-colors flex items-center gap-1
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">Feature temporarily unavailable</p>
            <p className="text-sm">Backend migration to Supabase in progress</p>
            <p className="text-xs mt-4 text-gray-400">Active tab: {activeTab}</p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
