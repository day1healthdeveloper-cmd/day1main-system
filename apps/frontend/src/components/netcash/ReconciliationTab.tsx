'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export function ReconciliationTab() {
  const [reconciliations, setReconciliations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [filters, setFilters] = useState({ status: '' });
  const [selectedReconciliation, setSelectedReconciliation] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);
  const [runDate, setRunDate] = useState('');
  const [discrepancies, setDiscrepancies] = useState<any[]>([]);
  const [showDiscrepanciesModal, setShowDiscrepanciesModal] = useState(false);
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<any>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveForm, setResolveForm] = useState({ resolution: '', notes: '' });

  useEffect(() => {
    fetchReconciliations();
    fetchStats();
  }, [filters]);

  const fetchReconciliations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      params.append('limit', '50');

      const data = await apiClient.get(`/netcash/reconciliation?${params}`) as any;
      setReconciliations(data.reconciliations || []);
    } catch (error) {
      console.error('Error fetching reconciliations:', error);
      setReconciliations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiClient.get('/netcash/reconciliation/stats/summary');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDiscrepancies = async (reconciliationId?: string) => {
    try {
      const params = new URLSearchParams();
      if (reconciliationId) params.append('reconciliationId', reconciliationId);
      params.append('resolved', 'false');
      params.append('limit', '100');

      const data = await apiClient.get(`/netcash/reconciliation/discrepancies/list?${params}`);
      setDiscrepancies(data.discrepancies || []);
      setShowDiscrepanciesModal(true);
    } catch (error) {
      console.error('Error fetching discrepancies:', error);
    }
  };

  const handleRunReconciliation = async () => {
    if (!runDate) {
      alert('Please select a date');
      return;
    }

    setProcessing(true);
    try {
      const result = await apiClient.post('/netcash/reconciliation/run', { date: runDate });
      alert(`Reconciliation completed:\n- Expected: R${result.total_expected?.toFixed(2)}\n- Received: R${result.total_received?.toFixed(2)}\n- Discrepancies: ${result.discrepancies}`);
      setShowRunModal(false);
      setRunDate('');
      fetchReconciliations();
      fetchStats();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to run reconciliation');
    } finally {
      setProcessing(false);
    }
  };

  const handleAutoReconcile = async () => {
    if (!confirm('Run auto-reconciliation for yesterday\'s transactions?')) return;

    setProcessing(true);
    try {
      const result = await apiClient.post('/netcash/reconciliation/auto');
      alert(result.message);
      fetchReconciliations();
      fetchStats();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to run auto-reconciliation');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewDetails = async (reconciliationId: string) => {
    try {
      const data = await apiClient.get(`/netcash/reconciliation/${reconciliationId}`);
      setSelectedReconciliation(data);
      setShowDetailsModal(true);
    } catch (error) {
      alert('Failed to load reconciliation details');
    }
  };

  const handleResolveDiscrepancy = async () => {
    if (!selectedDiscrepancy || !resolveForm.resolution) {
      alert('Please provide a resolution');
      return;
    }

    setProcessing(true);
    try {
      await apiClient.put(`/netcash/reconciliation/discrepancies/${selectedDiscrepancy.id}/resolve`, resolveForm);
      alert('Discrepancy resolved successfully');
      setShowResolveModal(false);
      setResolveForm({ resolution: '', notes: '' });
      fetchDiscrepancies();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to resolve discrepancy');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Reconciliations</p>
          <p className="text-2xl font-bold text-blue-600">{stats?.total || 0}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Received</p>
          <p className="text-2xl font-bold text-green-600">R{stats?.totals?.received?.toFixed(2) || '0.00'}</p>
          <p className="text-xs text-gray-500 mt-1">Successfully collected</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Discrepancy</p>
          <p className="text-2xl font-bold text-orange-600">R{stats?.totals?.discrepancy?.toFixed(2) || '0.00'}</p>
          <p className="text-xs text-gray-500 mt-1">Outstanding</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Avg Match Rate</p>
          <p className="text-2xl font-bold text-purple-600">{stats?.averageMatchRate?.toFixed(1) || '0'}%</p>
          <p className="text-xs text-gray-500 mt-1">Success rate</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">🔄 Payment Reconciliation</h2>
            <p className="text-sm text-gray-600 mt-1">Match payments to member accounts</p>
          </div>
          <div className="flex gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="reviewed">Reviewed</option>
              <option value="failed">Failed</option>
            </select>
            <button
              onClick={() => fetchDiscrepancies()}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
            >
              View Discrepancies
            </button>
            <button
              onClick={handleAutoReconcile}
              disabled={processing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50"
            >
              Auto-Reconcile
            </button>
            <button
              onClick={() => setShowRunModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Run Reconciliation
            </button>
          </div>
        </div>
      </div>

      {/* Reconciliations Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : reconciliations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No reconciliations found</p>
            <p className="text-sm mt-2">Run a reconciliation to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discrepancy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reconciliations.map((recon) => {
                  const matchRate = recon.total_expected > 0 
                    ? (recon.total_received / recon.total_expected) * 100 
                    : 0;
                  
                  return (
                    <tr key={recon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(recon.reconciliation_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        R{recon.total_expected?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        R{recon.total_received?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">
                        R{recon.discrepancy_amount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            matchRate >= 95
                              ? 'bg-green-100 text-green-800'
                              : matchRate >= 85
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {matchRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            recon.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : recon.status === 'reviewed'
                              ? 'bg-blue-100 text-blue-800'
                              : recon.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {recon.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(recon.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </button>
                          {recon.unmatched_count > 0 && (
                            <button
                              onClick={() => fetchDiscrepancies(recon.id)}
                              className="text-orange-600 hover:text-orange-800 font-medium"
                            >
                              Discrepancies ({recon.unmatched_count})
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Run Reconciliation Modal */}
      {showRunModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRunModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Run Reconciliation</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a date to reconcile payments for that day.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reconciliation Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={runDate}
                  onChange={(e) => setRunDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowRunModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRunReconciliation}
                disabled={processing || !runDate}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {processing ? 'Running...' : 'Run Reconciliation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedReconciliation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Reconciliation Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Expected</p>
                  <p className="text-xl font-bold text-blue-600">
                    R{selectedReconciliation.total_expected?.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Received</p>
                  <p className="text-xl font-bold text-green-600">
                    R{selectedReconciliation.total_received?.toFixed(2)}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Discrepancy</p>
                  <p className="text-xl font-bold text-orange-600">
                    R{selectedReconciliation.discrepancy_amount?.toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Match Rate</p>
                  <p className="text-xl font-bold text-purple-600">
                    {selectedReconciliation.total_expected > 0
                      ? ((selectedReconciliation.total_received / selectedReconciliation.total_expected) * 100).toFixed(1)
                      : '0'}%
                  </p>
                </div>
              </div>

              {/* Counts */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Transaction Counts</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Matched</p>
                    <p className="text-2xl font-bold text-green-600">{selectedReconciliation.matched_count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Unmatched</p>
                    <p className="text-2xl font-bold text-red-600">{selectedReconciliation.unmatched_count}</p>
                  </div>
                </div>
              </div>

              {/* Discrepancies */}
              {selectedReconciliation.discrepancies && selectedReconciliation.discrepancies.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Discrepancies ({selectedReconciliation.discrepancies.length})</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Member</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Expected</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Received</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Difference</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedReconciliation.discrepancies.map((disc: any) => (
                          <tr key={disc.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">
                              {disc.member?.member_number}
                              <div className="text-xs text-gray-500">
                                {disc.member?.first_name} {disc.member?.last_name}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm">R{disc.expected_amount?.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm">R{disc.received_amount?.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm font-semibold text-red-600">
                              R{disc.difference?.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {disc.resolved ? (
                                <span className="text-green-600">Resolved</span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedDiscrepancy(disc);
                                    setShowResolveModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Resolve
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discrepancies Modal */}
      {showDiscrepanciesModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDiscrepanciesModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Unresolved Discrepancies</h2>
              <button
                onClick={() => setShowDiscrepanciesModal(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {discrepancies.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No unresolved discrepancies found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {discrepancies.map((disc) => (
                      <tr key={disc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {disc.member?.member_number}
                            </div>
                            <div className="text-sm text-gray-500">
                              {disc.member?.first_name} {disc.member?.last_name}
                            </div>
                            <div className="text-xs text-gray-400">{disc.member?.broker_group}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          R{disc.expected_amount?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          R{disc.received_amount?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                          R{disc.difference?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {disc.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => {
                              setSelectedDiscrepancy(disc);
                              setShowResolveModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDiscrepanciesModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Discrepancy Modal */}
      {showResolveModal && selectedDiscrepancy && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowResolveModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Resolve Discrepancy</h2>
            <p className="text-sm text-gray-600 mb-4">
              Resolve discrepancy for {selectedDiscrepancy.member?.first_name}{' '}
              {selectedDiscrepancy.member?.last_name}
            </p>

            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Expected</p>
                  <p className="font-semibold">R{selectedDiscrepancy.expected_amount?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Received</p>
                  <p className="font-semibold">R{selectedDiscrepancy.received_amount?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Difference</p>
                  <p className="font-semibold text-red-600">R{selectedDiscrepancy.difference?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution <span className="text-red-500">*</span>
                </label>
                <select
                  value={resolveForm.resolution}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolution: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select resolution...</option>
                  <option value="payment_received">Payment Received</option>
                  <option value="partial_payment">Partial Payment</option>
                  <option value="refund_issued">Refund Issued</option>
                  <option value="write_off">Write Off</option>
                  <option value="system_error">System Error</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  rows={3}
                  value={resolveForm.notes}
                  onChange={(e) => setResolveForm({ ...resolveForm, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveDiscrepancy}
                disabled={processing || !resolveForm.resolution}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {processing ? 'Resolving...' : 'Resolve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
