'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';

type TabType = 'overview' | 'groups' | 'members' | 'transactions' | 'failed-payments' | 'refunds' | 'reconciliation' | 'webhooks' | 'reports' | 'batches' | 'today';

export default function DebitOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [todayBatches, setTodayBatches] = useState<any[]>([]);
  const [todayTransactions, setTodayTransactions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [failedPayments, setFailedPayments] = useState<any[]>([]);
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'individual' | 'group' | 'eft'>('all');

  useEffect(() => {
    if (activeTab === 'batches') {
      fetchBatches();
    } else if (activeTab === 'today') {
      fetchTodayBatches();
    } else if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'failed-payments') {
      fetchFailedPayments();
    }
  }, [activeTab]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/netcash/batches');
      const data = await response.json();
      setBatches(data.batches || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayBatches = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      // Fetch transactions with strike_date = today (loaded 3 days ago)
      const response = await fetch(`/api/operations/debit-orders/today?strike_date=${today}`);
      const data = await response.json();
      setTodayTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching today transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/netcash/transactions');
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFailedPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/netcash/failed-payments');
      const data = await response.json();
      setFailedPayments(data.failedPayments || []);
    } catch (error) {
      console.error('Error fetching failed payments:', error);
    } finally {
      setLoading(false);
    }
  };

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
              { id: 'today', label: "Today's Batches", icon: '📅' },
              { id: 'batches', label: 'All Batches', icon: '📋' },
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'groups', label: 'Groups', icon: '👥' },
              { id: 'members', label: 'Members', icon: '👤' },
              { id: 'transactions', label: 'Transactions', icon: '💳' },
              { id: 'failed-payments', label: 'Failed', icon: '⚠️' },
              { id: 'refunds', label: 'Refunds', icon: '💸' },
              { id: 'reconciliation', label: 'Reconcile', icon: '🔄' },
              { id: 'webhooks', label: 'Webhooks', icon: '📡' },
              { id: 'reports', label: 'Reports', icon: '📈' },
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
          {activeTab === 'today' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Today's Debit Order Transactions</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Strike Date: {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (Loaded 3 days ago for processing)
                  </p>
                </div>
                <button
                  onClick={() => router.push('/operations/debit-orders/run')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <span>🚀</span>
                  <span>Run New Batch</span>
                </button>
              </div>

              {/* Filter Buttons */}
              <div className="mb-6 flex gap-2">
                <button
                  onClick={() => setCollectionFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    collectionFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({todayTransactions.length})
                </button>
                <button
                  onClick={() => setCollectionFilter('individual')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    collectionFilter === 'individual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Individual Debit Orders ({todayTransactions.filter(t => t.collection_method === 'individual_debit_order').length})
                </button>
                <button
                  onClick={() => setCollectionFilter('group')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    collectionFilter === 'group'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Group Debit Orders ({todayTransactions.filter(t => t.collection_method === 'group_debit_order').length})
                </button>
                <button
                  onClick={() => setCollectionFilter('eft')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    collectionFilter === 'eft'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  EFT Payments ({todayTransactions.filter(t => t.collection_method === 'eft').length})
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : todayTransactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-lg mb-2 font-medium">No transactions scheduled for today</p>
                  <p className="text-sm">Transactions are loaded 3 days before the strike date</p>
                </div>
              ) : (
                <div>
                  {/* Summary Stats */}
                  <div className="mb-6 grid grid-cols-5 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-600 mb-1">Total Transactions</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {todayTransactions.filter(t => collectionFilter === 'all' || t.collection_method === (collectionFilter === 'individual' ? 'individual_debit_order' : collectionFilter === 'group' ? 'group_debit_order' : collectionFilter)).length}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        R{todayTransactions
                          .filter(t => collectionFilter === 'all' || t.collection_method === (collectionFilter === 'individual' ? 'individual_debit_order' : collectionFilter === 'group' ? 'group_debit_order' : collectionFilter))
                          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
                          .toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-xs text-gray-600 mb-1">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {todayTransactions.filter(t => (collectionFilter === 'all' || t.collection_method === (collectionFilter === 'individual' ? 'individual_debit_order' : collectionFilter === 'group' ? 'group_debit_order' : collectionFilter)) && t.status === 'pending').length}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Successful</p>
                      <p className="text-2xl font-bold text-green-600">
                        {todayTransactions.filter(t => (collectionFilter === 'all' || t.collection_method === (collectionFilter === 'individual' ? 'individual_debit_order' : collectionFilter === 'group' ? 'group_debit_order' : collectionFilter)) && t.status === 'success').length}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-xs text-gray-600 mb-1">Failed</p>
                      <p className="text-2xl font-bold text-red-600">
                        {todayTransactions.filter(t => (collectionFilter === 'all' || t.collection_method === (collectionFilter === 'individual' ? 'individual_debit_order' : collectionFilter === 'group' ? 'group_debit_order' : collectionFilter)) && t.status === 'failed').length}
                      </p>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collection Method</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {todayTransactions
                          .filter(t => collectionFilter === 'all' || t.collection_method === (collectionFilter === 'individual' ? 'individual_debit_order' : collectionFilter === 'group' ? 'group_debit_order' : collectionFilter))
                          .map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {transaction.member_name || `${transaction.first_name} ${transaction.last_name}`}
                              </div>
                              <div className="text-xs text-gray-500">{transaction.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.member_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                transaction.collection_method === 'individual_debit_order' ? 'bg-blue-100 text-blue-800' :
                                transaction.collection_method === 'group_debit_order' ? 'bg-purple-100 text-purple-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {transaction.collection_method === 'individual_debit_order' ? 'Individual' :
                                 transaction.collection_method === 'group_debit_order' ? 'Group' : 'EFT'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {transaction.group_name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              R{parseFloat(transaction.amount || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.bank_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                transaction.status === 'success' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                                transaction.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {transaction.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => router.push(`/operations/members/${transaction.member_id}`)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                View Member
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'batches' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Debit Order Batches</h2>
                <button
                  onClick={() => router.push('/operations/debit-orders/run')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  🚀 Run New Batch
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">No batches yet</p>
                  <p className="text-sm">Click "Run New Batch" to create your first debit order batch</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {batches.map((batch) => (
                        <tr key={batch.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            {batch.batch_number || batch.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(batch.action_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {batch.total_members}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            R{parseFloat(batch.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              batch.status === 'completed' ? 'bg-green-100 text-green-800' :
                              batch.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {batch.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(batch.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">All Transactions</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {tx.members?.first_name} {tx.members?.last_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            R{parseFloat(tx.amount || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {tx.bank_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              tx.status === 'success' ? 'bg-green-100 text-green-800' :
                              tx.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'failed-payments' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Failed Payments</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : failedPayments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No failed payments</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {failedPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.members?.first_name} {payment.members?.last_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {payment.members?.phone || payment.members?.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            R{parseFloat(payment.amount || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {payment.failure_reason || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!['today', 'batches', 'transactions', 'failed-payments'].includes(activeTab) && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Feature coming soon</p>
              <p className="text-sm">This section is under development</p>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
