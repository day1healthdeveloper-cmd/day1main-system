'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, FileText, User, Building2, Calendar, DollarSign, 
  Clock, CheckCircle, XCircle, AlertTriangle, Download, Eye 
} from 'lucide-react';

interface ClaimDetails {
  claim: any;
  auditTrail: any[];
  paymentInfo: any;
  benefitUsage: any;
}

export default function ClaimDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [details, setDetails] = useState<ClaimDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const claimId = params.id as string;

  useEffect(() => {
    if (claimId) {
      fetchClaimDetails();
    }
  }, [claimId]);

  const fetchClaimDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/claims/${claimId}`);
      if (response.ok) {
        const data = await response.json();
        setDetails(data);
      } else {
        alert('Claim not found');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching claim details:', error);
      alert('Failed to load claim details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; icon: any }> = {
      submitted: { bg: 'bg-blue-100 text-blue-800', icon: FileText },
      pending: { bg: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { bg: 'bg-green-100 text-green-800', icon: CheckCircle },
      paid: { bg: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100 text-red-800', icon: XCircle },
      pended: { bg: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
    };

    const style = styles[status] || { bg: 'bg-gray-100 text-gray-800', icon: FileText };
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${style.bg}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (!details) return null;

  const { claim, auditTrail, paymentInfo, benefitUsage } = details;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{claim.claim_number}</h1>
              <p className="text-gray-600 mt-1">Claim Details</p>
            </div>
          </div>
          {getStatusBadge(claim.claim_status)}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            {['overview', 'documents', 'history', 'payment'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Claim Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Claim Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Claim Number</p>
                      <p className="font-mono font-medium">{claim.claim_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Benefit Type</p>
                      <p className="font-medium">{claim.benefit_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Service Date</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(claim.service_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Submission Date</p>
                      <p className="font-medium">
                        {new Date(claim.submission_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Claimed Amount</p>
                      <p className="font-bold text-lg">
                        R{parseFloat(claim.claimed_amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Approved Amount</p>
                      <p className="font-bold text-lg text-green-600">
                        {claim.approved_amount
                          ? `R${parseFloat(claim.approved_amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Medical Codes */}
                  {(claim.icd10_codes || claim.tariff_codes) && (
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-sm font-medium text-gray-900 mb-3">Medical Codes</p>
                      <div className="flex flex-wrap gap-2">
                        {claim.icd10_codes && claim.icd10_codes.map((code: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-mono">
                            ICD-10: {code}
                          </span>
                        ))}
                        {claim.tariff_codes && claim.tariff_codes.map((code: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-mono">
                            Tariff: {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Claim-specific data */}
                  {claim.claim_data && Object.keys(claim.claim_data).length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-sm font-medium text-gray-900 mb-3">Additional Information</p>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(claim.claim_data).map(([key, value]: [string, any]) => (
                          <div key={key}>
                            <p className="text-xs text-gray-600 mb-1">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-sm font-medium">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rejection/Pend Reason */}
              {claim.rejection_reason && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-800 flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      Rejection Reason
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {claim.rejection_code && (
                      <p className="text-sm font-mono text-red-700 mb-2">
                        Code: {claim.rejection_code}
                      </p>
                    )}
                    <p className="text-red-800">{claim.rejection_reason}</p>
                  </CardContent>
                </Card>
              )}

              {claim.pend_reason && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-orange-800 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Additional Information Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-orange-800">{claim.pend_reason}</p>
                  </CardContent>
                </Card>
              )}

              {/* Benefit Usage */}
              {benefitUsage && (
                <Card>
                  <CardHeader>
                    <CardTitle>Benefit Usage</CardTitle>
                    <CardDescription>
                      {claim.benefit_type} for {new Date(claim.service_date).getFullYear()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Annual Limit</span>
                          <span className="font-medium">
                            R{parseFloat(benefitUsage.annual_limit).toLocaleString('en-ZA')}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Used</span>
                          <span className="font-medium text-orange-600">
                            R{parseFloat(benefitUsage.used_amount).toLocaleString('en-ZA')}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Remaining</span>
                          <span className="font-medium text-green-600">
                            R{parseFloat(benefitUsage.remaining_amount).toLocaleString('en-ZA')}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(parseFloat(benefitUsage.remaining_amount) / parseFloat(benefitUsage.annual_limit)) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Member Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Member
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Name</p>
                    <p className="font-medium">
                      {claim.members?.first_name} {claim.members?.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Member Number</p>
                    <p className="font-mono text-sm">{claim.members?.member_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Plan</p>
                    <p className="font-medium">{claim.members?.plan_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Contact</p>
                    <p className="text-sm">{claim.members?.email}</p>
                    <p className="text-sm">{claim.members?.mobile}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Provider Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Provider
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Practice Name</p>
                    <p className="font-medium">{claim.providers?.practice_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Provider Type</p>
                    <p className="font-medium">{claim.providers?.provider_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Practice Number</p>
                    <p className="font-mono text-sm">{claim.providers?.practice_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Contact</p>
                    <p className="text-sm">{claim.providers?.email}</p>
                    <p className="text-sm">{claim.providers?.phone}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle>Claim Documents</CardTitle>
              <CardDescription>
                {claim.claim_documents?.length || 0} document(s) attached
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!claim.claim_documents || claim.claim_documents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No documents attached to this claim</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {claim.claim_documents.map((doc: any) => (
                    <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{doc.document_type}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={doc.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 rounded"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </a>
                          <a
                            href={doc.document_url}
                            download
                            className="p-2 hover:bg-gray-100 rounded"
                          >
                            <Download className="w-4 h-4 text-gray-600" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>Claim History</CardTitle>
              <CardDescription>Audit trail of all claim activities</CardDescription>
            </CardHeader>
            <CardContent>
              {!auditTrail || auditTrail.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No history available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditTrail.map((entry: any, idx: number) => (
                    <div key={entry.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        {idx < auditTrail.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <p className="font-medium text-gray-900">{entry.action}</p>
                        <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(entry.created_at).toLocaleString()}
                          {entry.performed_by && ` • ${entry.performed_by}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              {!paymentInfo ? (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payment information available</p>
                  <p className="text-sm mt-2">
                    {claim.claim_status === 'approved'
                      ? 'Payment is being processed'
                      : 'Claim must be approved before payment'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        R{parseFloat(paymentInfo.payment_amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                      <p className="text-lg font-medium capitalize">{paymentInfo.payment_status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                      <p className="font-medium uppercase">{paymentInfo.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Date</p>
                      <p className="font-medium">
                        {paymentInfo.payment_date
                          ? new Date(paymentInfo.payment_date).toLocaleDateString()
                          : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {paymentInfo.payment_reference && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-1">Payment Reference</p>
                      <p className="font-mono text-green-900">{paymentInfo.payment_reference}</p>
                    </div>
                  )}

                  {paymentInfo.payment_batches && (
                    <div className="pt-6 border-t">
                      <p className="text-sm font-medium text-gray-900 mb-3">Batch Information</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Batch Number</p>
                          <p className="font-mono text-sm">{paymentInfo.payment_batches.batch_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Batch Date</p>
                          <p className="text-sm">
                            {new Date(paymentInfo.payment_batches.batch_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payee Information */}
                  <div className="pt-6 border-t">
                    <p className="text-sm font-medium text-gray-900 mb-3">Payee Information</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Payee Name</p>
                        <p className="font-medium">{paymentInfo.payee_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Payee Type</p>
                        <p className="font-medium capitalize">{paymentInfo.payee_type}</p>
                      </div>
                      {paymentInfo.bank_name && (
                        <>
                          <div>
                            <p className="text-xs text-gray-600">Bank</p>
                            <p className="font-medium">{paymentInfo.bank_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Account Number</p>
                            <p className="font-mono text-sm">{paymentInfo.account_number}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
