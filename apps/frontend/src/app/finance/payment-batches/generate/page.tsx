'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/payment-processing';

export default function GeneratePaymentBatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [batchType, setBatchType] = useState<'provider' | 'member_refund' | 'mixed'>('provider');
  const [paymentMethod, setPaymentMethod] = useState('eft');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/finance/payment-batches/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_type: batchType,
          payment_method: paymentMethod,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.invalid_claims) {
          // Show invalid banking details
          setError(`${data.invalid_count} claims have invalid banking details. Please fix these before generating batch.`);
          setResult({ invalid_claims: data.invalid_claims });
        } else {
          throw new Error(data.error || 'Failed to generate batch');
        }
        return;
      }

      setResult(data);
    } catch (err) {
      console.error('Error generating batch:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generate Payment Batch</h1>
          <p className="text-gray-600 mt-1">Create a new payment batch for approved claims</p>
        </div>

        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Configuration</CardTitle>
            <CardDescription>Select batch type and filters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Batch Type <span className="text-red-500">*</span>
              </label>
              <select
                value={batchType}
                onChange={(e) => setBatchType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="provider">Provider Payments (Direct Claims)</option>
                <option value="member_refund">Member Refunds (Member-Submitted Claims)</option>
                <option value="mixed">Mixed (Both Provider and Member)</option>
              </select>
              <p className="text-xs text-gray-500">
                {batchType === 'provider' && 'Payments to healthcare providers for direct claims'}
                {batchType === 'member_refund' && 'Refunds to members for claims they submitted'}
                {batchType === 'mixed' && 'Combined batch with both provider payments and member refunds'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="eft">EFT (Electronic Funds Transfer)</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Approval Date From</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Approval Date To</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This will include all approved claims that have not been paid yet. 
                Claims with invalid banking details will be excluded.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Batch'}
              </Button>
              <Button variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">Error Generating Batch</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invalid Claims Display */}
        {result?.invalid_claims && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">Claims with Invalid Banking Details</CardTitle>
              <CardDescription>These claims cannot be included in the batch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.invalid_claims.map((claim: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-orange-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{claim.claim_number}</p>
                        <p className="text-sm text-gray-600">{claim.payee_name}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-orange-900">Validation Errors:</p>
                      <ul className="text-sm text-orange-700 mt-1 space-y-1">
                        {claim.validation.errors.map((err: string, i: number) => (
                          <li key={i}>• {err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Display */}
        {result?.success && (
          <>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">Batch Generated Successfully!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Batch Number: <span className="font-mono">{result.batch.batch_number}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Batch Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Batch Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Total Claims</p>
                    <p className="text-2xl font-bold">{result.summary.total_claims}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Unique Payees</p>
                    <p className="text-2xl font-bold">{result.summary.unique_payees}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(result.summary.total_amount)}
                    </p>
                  </div>
                </div>

                {/* Payee Breakdown */}
                <div>
                  <h4 className="font-medium mb-3">Payee Breakdown</h4>
                  <div className="space-y-2">
                    {result.summary.payee_breakdown.map((payee: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{payee.payee_name}</p>
                          <p className="text-sm text-gray-600">
                            {payee.claim_count} claim{payee.claim_count > 1 ? 's' : ''} • {payee.payee_type}
                          </p>
                        </div>
                        <p className="font-bold">{formatCurrency(payee.total_amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-6 pt-6 border-t">
                  <Button onClick={() => router.push(`/finance/payment-batches/${result.batch.id}`)}>
                    View Batch Details
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/finance/payment-batches')}>
                    Back to Batches
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
