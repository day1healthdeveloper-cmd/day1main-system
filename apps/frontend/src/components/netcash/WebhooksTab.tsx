'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export function WebhooksTab() {
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [filters, setFilters] = useState({ processed: '' });
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchWebhookLogs();
    fetchStats();
  }, [filters]);

  const fetchWebhookLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.processed !== '') params.append('processed', filters.processed);
      params.append('limit', '50');

      const data = await apiClient.get(`/netcash/webhook/logs?${params}`);
      setWebhookLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
      setWebhookLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiClient.get('/netcash/webhook/stats/summary');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRetryWebhook = async (webhookId: string) => {
    if (!confirm('Retry processing this webhook?')) return;

    setProcessing(true);
    try {
      await apiClient.post(`/netcash/webhook/${webhookId}/retry`);
      alert('Webhook retried successfully');
      fetchWebhookLogs();
      fetchStats();
      if (selectedLog?.id === webhookId) {
        setShowDetailsModal(false);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to retry webhook');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Webhooks</p>
          <p className="text-2xl font-bold text-blue-600">{stats?.total || 0}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Processed</p>
          <p className="text-2xl font-bold text-green-600">{stats?.processed || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Successfully processed</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats?.failed || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Processing errors</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Success Rate</p>
          <p className="text-2xl font-bold text-purple-600">{stats?.successRate?.toFixed(1) || '0'}%</p>
          <p className="text-xs text-gray-500 mt-1">Processing success</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">📡 Webhook Logs</h2>
            <p className="text-sm text-gray-600 mt-1">Real-time payment notifications from Netcash</p>
          </div>
          <div className="flex gap-3">
            <select
              value={filters.processed}
              onChange={(e) => setFilters({ ...filters, processed: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Webhooks</option>
              <option value="true">Processed</option>
              <option value="false">Pending/Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Webhook Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : webhookLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No webhook logs found</p>
            <p className="text-sm mt-2">Webhooks will appear here when received from Netcash</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {webhookLogs.map((log) => {
                  let payload: any = {};
                  try {
                    payload = JSON.parse(log.payload);
                  } catch (e) {}

                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.received_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payload.transactionReference ? 'Transaction' : payload.batchReference ? 'Batch' : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        {payload.transactionReference || payload.batchReference || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.processed && !log.error_message ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Processed
                          </span>
                        ) : log.processed && log.error_message ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Failed
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.processed_at ? new Date(log.processed_at).toLocaleString() : 'Not processed'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(log)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </button>
                          {(log.error_message || !log.processed) && (
                            <button
                              onClick={() => handleRetryWebhook(log.id)}
                              disabled={processing}
                              className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                            >
                              Retry
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

      {/* Details Modal */}
      {showDetailsModal && selectedLog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Webhook Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                {selectedLog.processed && !selectedLog.error_message ? (
                  <span className="px-4 py-2 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                    PROCESSED
                  </span>
                ) : selectedLog.processed && selectedLog.error_message ? (
                  <span className="px-4 py-2 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                    FAILED
                  </span>
                ) : (
                  <span className="px-4 py-2 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    PENDING
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  Received {new Date(selectedLog.received_at).toLocaleString()}
                </span>
              </div>

              {/* Timing */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Timing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Received At</p>
                    <p className="font-medium">{new Date(selectedLog.received_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Processed At</p>
                    <p className="font-medium">
                      {selectedLog.processed_at
                        ? new Date(selectedLog.processed_at).toLocaleString()
                        : 'Not processed'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payload */}
              <div>
                <h3 className="font-semibold mb-2">Payload</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(JSON.parse(selectedLog.payload), null, 2)}
                </pre>
              </div>

              {/* Signature */}
              {selectedLog.signature && (
                <div>
                  <h3 className="font-semibold mb-2">Signature</h3>
                  <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-xs font-mono">
                    {selectedLog.signature}
                  </pre>
                </div>
              )}

              {/* Error Message */}
              {selectedLog.error_message && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Error</h3>
                  <p className="text-red-700 text-sm">{selectedLog.error_message}</p>
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
              {(selectedLog.error_message || !selectedLog.processed) && (
                <button
                  onClick={() => handleRetryWebhook(selectedLog.id)}
                  disabled={processing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
                >
                  {processing ? 'Retrying...' : 'Retry Webhook'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
