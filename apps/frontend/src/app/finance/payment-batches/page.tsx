'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FileText, CheckCircle, Clock, XCircle, Plus, Eye } from 'lucide-react';
import { formatCurrency, getBatchStatusColor } from '@/lib/payment-processing';

interface PaymentBatch {
  id: string;
  batch_number: string;
  batch_type: string;
  batch_date: string;
  total_claims: number;
  total_amount: string;
  status: string;
  payment_method: string;
  eft_file_generated: boolean;
  eft_file_url?: string;
  created_at: string;
  approved_at?: string;
  processed_at?: string;
  completed_at?: string;
}

export default function PaymentBatchesPage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();
  const [batches, setBatches] = useState<PaymentBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBatches();
    }
  }, [statusFilter, isAuthenticated]);

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`/api/finance/payment-batches?${params}`);
      const data = await response.json();
      setBatches(data.batches || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleBatchAction = async (batchId: string, action: string) => {
    const confirmMessage = {
      approve: 'Are you sure you want to approve this batch?',
      process: 'This will generate the EFT file. Continue?',
      complete: 'Mark this batch as completed and update all claims to paid?',
      cancel: 'Cancel this batch? This cannot be undone.'
    }[action];

    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await fetch(`/api/finance/payment-batches/${batchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update batch');
      }

      alert(data.message);
      fetchBatches();
    } catch (error) {
      console.error(`Error ${action}ing batch:`, error);
      alert(error instanceof Error ? error.message : 'Failed to update batch');
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!window.confirm('Delete this draft batch? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/finance/payment-batches/${batchId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete batch');
      }

      alert('Batch deleted successfully');
      fetchBatches();
    } catch (error) {
      console.error('Error deleting batch:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete batch');
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!isAuthenticated) return null;

  const filteredBatches = batches.filter(batch => 
    batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBatchStatusColor(status)}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Batches</h1>
            <p className="text-gray-600 mt-1">Manage claim payment batches and EFT processing</p>
          </div>
          <Button onClick={() => router.push('/finance/payment-batches/generate')}>
            <Plus className="w-4 h-4 mr-2" />
            Generate Batch
          </Button>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Batches</p>
                  <p className="text-3xl font-bold mt-1">{summary.total_batches}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Draft</p>
                  <p className="text-3xl font-bold mt-1 text-gray-600">{summary.draft}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Processing</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-600">{summary.processing}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{summary.completed}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold mt-1 text-blue-600">
                    {formatCurrency(summary.total_amount)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input 
                  placeholder="Batch number..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="approved">Approved</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batches Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Batches</CardTitle>
            <CardDescription>Showing {filteredBatches.length} batches</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingBatches ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading batches...</p>
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No payment batches found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Batch Number</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-right py-3 px-4 font-medium">Claims</th>
                      <th className="text-right py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBatches.map((batch) => (
                      <tr key={batch.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-mono text-sm">{batch.batch_number}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(batch.created_at).toLocaleString()}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize">{batch.batch_type.replace('_', ' ')}</span>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(batch.batch_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">{batch.total_claims}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(parseFloat(batch.total_amount))}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(batch.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => router.push(`/finance/payment-batches/${batch.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            {batch.status === 'draft' && (
                              <>
                                <Button 
                                  size="sm"
                                  onClick={() => handleBatchAction(batch.id, 'approve')}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600"
                                  onClick={() => handleDeleteBatch(batch.id)}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                            
                            {batch.status === 'approved' && (
                              <Button 
                                size="sm"
                                onClick={() => handleBatchAction(batch.id, 'process')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Process
                              </Button>
                            )}
                            
                            {batch.status === 'processing' && (
                              <>
                                {batch.eft_file_url && (
                                  <a 
                                    href={batch.eft_file_url} 
                                    download
                                    className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                )}
                                <Button 
                                  size="sm"
                                  onClick={() => handleBatchAction(batch.id, 'complete')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Complete
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
