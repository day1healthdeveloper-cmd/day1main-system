'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, CheckCircle, XCircle, Clock, FileText, User, Building2, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, getBatchStatusColor, getPaymentStatusColor } from '@/lib/payment-processing';

interface Payment {
  id: string;
  claim_id: string;
  payee_type: string;
  payee_name: string;
  bank_name?: string;
  account_number?: string;
  branch_code?: string;
  account_holder_name?: string;
  payment_amount: string;
  payment_status: string;
  payment_date?: string;
  payment_reference?: string;
  claim: {
    claim_number: string;
    service_date: string;
    benefit_type: string;
  };
}

interface BatchDetails {
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
  eft_file_generated_at?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  processed_at?: string;
  processed_by?: string;
  completed_at?: string;
  notes?: string;
  payments: Payment[];
}

export default function BatchDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { loading, isAuthenticated } = useAuth();
  const [batch, setBatch] = useState<BatchDetails | null>(null);
  const [loadingBatch, setLoadingBatch] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const batchId = params.id as string;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && batchId) {
      fetchBatchDetails();
    }
  }, [batchId, isAuthenticated]);

  const fetchBatchDetails = async () => {
    try {
      setLoadingBatch(true);
      const response = await fetch(`/api/finance/payment-batches/${batchId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch batch');
      }
      
      setBatch(data.batch);
    } catch (error) {
      console.error('Error fetching batch:', error);
      alert(error instanceof Error ? error.message : 'Failed to fetch batch');
    } finally {
      setLoadingBatch(false);
    }
  };

  const handleBatchAction = async (action: string) => {
    const confirmMessages: Record<string, string> = {
      approve: 'Are you sure you want to approve this batch? This will allow it to be processed.',
      process: 'This will generate the EFT file and mark payments as processing. Continue?',
      complete: 'Mark this batch as completed? All claims will be updated to paid status.',
      cancel: 'Cancel this batch? This cannot be undone and all payments will be cancelled.'
    };

    if (!window.confirm(confirmMessages[action])) return;

    try {
      setActionLoading(true);
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
      fetchBatchDetails();
    } catch (error) {
      console.error(`Error ${action}ing batch:`, error);
      alert(error instanceof Error ? error.message : 'Failed to update batch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (!window.confirm('Delete this draft batch? This cannot be undone.')) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/finance/payment-batches/${batchId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete batch');
      }

      alert('Batch deleted successfully');
      router.push('/finance/payment-batches');
    } catch (error) {
      console.error('Error deleting batch:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete batch');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || loadingBatch) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading batch details...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!isAuthenticated || !batch) return null;

  const getStatusBadge = (status: string) => {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBatchStatusColor(status)}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(status)}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  // Group payments by payee type
  const providerPayments = batch.payments.filter(p => p.payee_type === 'provider');
  const memberPayments = batch.payments.filter(p => p.payee_type === 'member');

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/finance/payment-batches')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Batches
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{batch.batch_number}</h1>
              <p className="text-gray-600 mt-1">Payment Batch Details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(batch.status)}
            
            {/* Action Buttons */}
            {batch.status === 'draft' && (
              <>
                <Button 
                  onClick={() => handleBatchAction('approve')}
                  disabled={actionLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Batch
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleDeleteBatch}
                  disabled={actionLoading}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
            
            {batch.status === 'approved' && (
              <Button 
                onClick={() => handleBatchAction('process')}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Process & Generate EFT
              </Button>
            )}
            
            {batch.status === 'processing' && (
              <>
                {batch.eft_file_url && (
                  <a 
                    href={batch.eft_file_url} 
                    download
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download EFT File
                  </a>
                )}
                <Button 
                  onClick={() => handleBatchAction('complete')}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Completed
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Batch Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Claims</p>
                  <p className="text-2xl font-bold">{batch.total_claims}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(parseFloat(batch.total_amount))}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Provider Payments</p>
                  <p className="text-2xl font-bold">{providerPayments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Refunds</p>
                  <p className="text-2xl font-bold">{memberPayments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Batch Information */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Batch Type</p>
                <p className="font-medium capitalize">{batch.batch_type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                <p className="font-medium uppercase">{batch.payment_method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Batch Date</p>
                <p className="font-medium">{new Date(batch.batch_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Created At</p>
                <p className="font-medium">{new Date(batch.created_at).toLocaleString()}</p>
              </div>
              {batch.approved_at && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved At</p>
                  <p className="font-medium">{new Date(batch.approved_at).toLocaleString()}</p>
                </div>
              )}
              {batch.processed_at && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Processed At</p>
                  <p className="font-medium">{new Date(batch.processed_at).toLocaleString()}</p>
                </div>
              )}
              {batch.completed_at && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed At</p>
                  <p className="font-medium">{new Date(batch.completed_at).toLocaleString()}</p>
                </div>
              )}
              {batch.eft_file_generated && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">EFT File Generated</p>
                  <p className="font-medium text-green-600">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Yes
                  </p>
                </div>
              )}
            </div>
            {batch.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-1">Notes</p>
                <p className="text-gray-900">{batch.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle>Payments ({batch.payments.length})</CardTitle>
            <CardDescription>Individual payments in this batch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Claim Number</th>
                    <th className="text-left py-3 px-4 font-medium">Payee</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Banking Details</th>
                    <th className="text-left py-3 px-4 font-medium">Service Date</th>
                    <th className="text-right py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-mono text-sm">{payment.claim.claim_number}</p>
                        <p className="text-xs text-gray-500">{payment.claim.benefit_type}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{payment.payee_name}</p>
                        <p className="text-xs text-gray-500">{payment.account_holder_name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          payment.payee_type === 'provider' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {payment.payee_type === 'provider' ? (
                            <><Building2 className="w-3 h-3 mr-1" /> Provider</>
                          ) : (
                            <><User className="w-3 h-3 mr-1" /> Member</>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {payment.bank_name ? (
                          <div className="text-sm">
                            <p className="font-medium">{payment.bank_name}</p>
                            <p className="text-xs text-gray-500">
                              {payment.account_number} • {payment.branch_code}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-red-600">Missing</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(payment.claim.service_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(parseFloat(payment.payment_amount))}
                      </td>
                      <td className="py-3 px-4">
                        {getPaymentBadge(payment.payment_status)}
                      </td>
                      <td className="py-3 px-4">
                        {payment.payment_reference ? (
                          <p className="font-mono text-xs">{payment.payment_reference}</p>
                        ) : (
                          <span className="text-xs text-gray-400">Not generated</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td colSpan={5} className="py-3 px-4 text-right">Total:</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(parseFloat(batch.total_amount))}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Breakdown by Payee Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providerPayments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Provider Payments
                </CardTitle>
                <CardDescription>{providerPayments.length} payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {providerPayments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{payment.payee_name}</p>
                        <p className="text-xs text-gray-500">{payment.claim.claim_number}</p>
                      </div>
                      <p className="font-bold">{formatCurrency(parseFloat(payment.payment_amount))}</p>
                    </div>
                  ))}
                  <div className="pt-3 border-t flex justify-between items-center">
                    <p className="font-bold">Subtotal:</p>
                    <p className="font-bold text-lg">
                      {formatCurrency(providerPayments.reduce((sum, p) => sum + parseFloat(p.payment_amount), 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {memberPayments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-600" />
                  Member Refunds
                </CardTitle>
                <CardDescription>{memberPayments.length} payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {memberPayments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{payment.payee_name}</p>
                        <p className="text-xs text-gray-500">{payment.claim.claim_number}</p>
                      </div>
                      <p className="font-bold">{formatCurrency(parseFloat(payment.payment_amount))}</p>
                    </div>
                  ))}
                  <div className="pt-3 border-t flex justify-between items-center">
                    <p className="font-bold">Subtotal:</p>
                    <p className="font-bold text-lg">
                      {formatCurrency(memberPayments.reduce((sum, p) => sum + parseFloat(p.payment_amount), 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
