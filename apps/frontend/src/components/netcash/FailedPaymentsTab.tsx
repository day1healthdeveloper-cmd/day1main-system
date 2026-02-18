'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export function FailedPaymentsTab() {
  const [failedPayments, setFailedPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [filters, setFilters] = useState({ brokerGroup: '', minRetries: '' });
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendForm, setSuspendForm] = useState({ memberId: '', reason: '', notes: '' });
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyForm, setNotifyForm] = useState({ memberId: '', notificationType: 'email', message: '' });

  useEffect(() => {
    fetchFailedPayments();
    fetchStats();
  }, [filters]);

  const fetchFailedPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.brokerGroup) params.append('brokerGroup', filters.brokerGroup);
      if (filters.minRetries) params.append('minRetries', filters.minRetries);
      params.append('limit', '50');

      // Use Next.js API route instead of direct backend call
      const response = await fetch(`/api/netcash/failed-payments?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch failed payments');
      }
      
      const data = await response.json();
      setFailedPayments(data.transactions || []);
    } catch (error) {
      console.error('Error fetching failed payments:', error);
      setFailedPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Use Next.js API route instead of direct backend call
      const response = await fetch('/api/netcash/failed-payments/stats/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAutoRetry = async () => {
    if (!confirm('Run auto-retry for all failed payments with less than 3 attempts?')) return;

    setProcessing(true);
    try {
      const result = await (apiClient.post as any)('/netcash/failed-payments/auto-retry', {});
      alert(`Auto-retry completed:\n- Total: ${result.total}\n- Retried: ${result.retried}\n- Successful: ${result.successful}\n- Failed: ${result.failed}`);
      fetchFailedPayments();
      fetchStats();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to run auto-retry');
    } finally {
      setProcessing(false);
    }
  };

  const handleRetryPayment = async (transactionId: string) => {
    const notes = prompt('Add notes for this retry (optional):');
    
    setProcessing(true);
    try {
      await (apiClient.post as any)(`/netcash/failed-payments/${transactionId}/retry`, { notes });
      alert('Payment retry initiated successfully');
      fetchFailedPayments();
      fetchStats();
      if (selectedPayment?.id === transactionId) {
        setShowDetailsModal(false);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to retry payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleEscalate = async (transactionId: string) => {
    const reason = prompt('Escalation reason:');
    if (!reason) return;

    setProcessing(true);
    try {
      await (apiClient.post as any)(`/netcash/failed-payments/${transactionId}/escalate`, {
        escalationReason: reason,
      });
      alert('Payment escalated for manual review');
      fetchFailedPayments();
      if (selectedPayment?.id === transactionId) {
        setShowDetailsModal(false);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to escalate payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleSuspendMember = async () => {
    if (!suspendForm.memberId || !suspendForm.reason) {
      alert('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    try {
      await (apiClient.post as any)('/netcash/failed-payments/suspend-member', suspendForm);
      alert('Member suspended successfully');
      setShowSuspendModal(false);
      setSuspendForm({ memberId: '', reason: '', notes: '' });
      fetchFailedPayments();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to suspend member');
    } finally {
      setProcessing(false);
    }
  };

  const handleNotifyMember = async () => {
    if (!notifyForm.memberId || !notifyForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    try {
      await (apiClient.post as any)('/netcash/failed-payments/notify-member', notifyForm);
      alert('Notification sent successfully');
      setShowNotifyModal(false);
      setNotifyForm({ memberId: '', notificationType: 'email', message: '' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewDetails = (payment: any) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats?.total || 0}</p>
          <p className="text-xs text-gray-500 mt-1">All failed payments</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-orange-600">R{stats?.totalAmount?.toFixed(2) || '0.00'}</p>
          <p className="text-xs text-gray-500 mt-1">Outstanding</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Can Retry</p>
          <p className="text-2xl font-bold text-yellow-600">{stats?.canRetry || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Less than 3 attempts</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Needs Escalation</p>
          <p className="text-2xl font-bold text-purple-600">{stats?.needsEscalation || 0}</p>
          <p className="text-xs text-gray-500 mt-1">3+ attempts</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">⚠️ Failed Payments</h2>
            <p className="text-sm text-gray-600 mt-1">Manage and retry failed debit orders</p>
          </div>
          <div className="flex gap-3">
            <select
              value={filters.minRetries}
              onChange={(e) => setFilters({ ...filters, minRetries: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Retries</option>
              <option value="0">0 retries</option>
              <option value="1">1+ retries</option>
              <option value="2">2+ retries</option>
              <option value="3">3+ retries (escalate)</option>
            </select>
            <button
              onClick={handleAutoRetry}
              disabled={processing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50"
            >
              Auto-Retry All
            </button>
          </div>
        </div>
      </div>

      {/* Failed Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : failedPayments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No failed payments found</p>
            <p className="text-sm mt-2">All payments are processing successfully</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failure Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {failedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.member?.member_number || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.member?.first_name} {payment.member?.last_name}
                        </div>
                        <div className="text-xs text-gray-400">{payment.member?.broker_group}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      R{payment.amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.retry_count >= 3
                            ? 'bg-red-100 text-red-800'
                            : payment.retry_count >= 2
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {payment.retry_count || 0} / 3
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {payment.rejection_reason || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(payment)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </button>
                        {payment.retry_count < 3 && (
                          <button
                            onClick={() => handleRetryPayment(payment.id)}
                            disabled={processing}
                            className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                          >
                            Retry
                          </button>
                        )}
                        {payment.retry_count >= 3 && (
                          <button
                            onClick={() => handleEscalate(payment.id)}
                            disabled={processing}
                            className="text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50"
                          >
                            Escalate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Failed Payment Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                  FAILED
                </span>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    selectedPayment.retry_count >= 3
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {selectedPayment.retry_count || 0} / 3 Retries
                </span>
              </div>

              {/* Member Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Member Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Member Number</p>
                    <p className="font-medium">{selectedPayment.member?.member_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">
                      {selectedPayment.member?.first_name} {selectedPayment.member?.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Broker Group</p>
                    <p className="font-medium">{selectedPayment.member?.broker_group || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium">{selectedPayment.member?.debit_order_status || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-2xl font-bold text-red-600">R{selectedPayment.amount?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transaction Date</p>
                    <p className="font-medium">{new Date(selectedPayment.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Failure Reason</p>
                    <p className="font-medium">{selectedPayment.rejection_reason || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Retry Count</p>
                    <p className="font-medium">{selectedPayment.retry_count || 0} / 3</p>
                  </div>
                </div>
              </div>

              {/* Netcash Response */}
              {selectedPayment.netcash_response && (
                <div>
                  <h3 className="font-semibold mb-2">Netcash Response</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                    {selectedPayment.netcash_response}
                  </pre>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSuspendForm({ memberId: selectedPayment.member_id, reason: '', notes: '' });
                  setShowSuspendModal(true);
                }}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
              >
                Suspend Member
              </button>
              <button
                onClick={() => {
                  setNotifyForm({ memberId: selectedPayment.member_id, notificationType: 'email', message: '' });
                  setShowNotifyModal(true);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Notify Member
              </button>
              {selectedPayment.retry_count < 3 ? (
                <button
                  onClick={() => handleRetryPayment(selectedPayment.id)}
                  disabled={processing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
                >
                  {processing ? 'Retrying...' : 'Retry Payment'}
                </button>
              ) : (
                <button
                  onClick={() => handleEscalate(selectedPayment.id)}
                  disabled={processing}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50"
                >
                  {processing ? 'Escalating...' : 'Escalate'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suspend Member Modal */}
      {showSuspendModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowSuspendModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Suspend Member</h2>
            <p className="text-sm text-gray-600 mb-4">
              Suspend this member due to repeated payment failures.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={suspendForm.reason}
                  onChange={(e) => setSuspendForm({ ...suspendForm, reason: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select reason...</option>
                  <option value="repeated_failures">Repeated Payment Failures</option>
                  <option value="insufficient_funds">Insufficient Funds</option>
                  <option value="invalid_account">Invalid Bank Account</option>
                  <option value="member_request">Member Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  rows={3}
                  value={suspendForm.notes}
                  onChange={(e) => setSuspendForm({ ...suspendForm, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendMember}
                disabled={processing}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50"
              >
                {processing ? 'Suspending...' : 'Suspend Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notify Member Modal */}
      {showNotifyModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowNotifyModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notify Member</h2>
            <p className="text-sm text-gray-600 mb-4">
              Send a notification to the member about their failed payment.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={notifyForm.notificationType}
                  onChange={(e) => setNotifyForm({ ...notifyForm, notificationType: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="both">Both Email & SMS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={notifyForm.message}
                  onChange={(e) => setNotifyForm({ ...notifyForm, message: e.target.value })}
                  placeholder="Enter notification message..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowNotifyModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleNotifyMember}
                disabled={processing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {processing ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
