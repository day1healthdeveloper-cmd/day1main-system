'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';

interface FraudCase {
  id: string;
  claim_number: string;
  member: { first_name: string; last_name: string; member_number: string } | null;
  provider: { name: string; provider_number: string } | null;
  service_date: string;
  claim_type: string;
  claimed_amount: string;
  status: string;
  submission_date: string;
  fraud_alert_triggered: boolean;
  fraud_risk_score: number | null;
  fraud_review_status: string | null;
  fraud_review_notes: string | null;
  icd10_codes: string[];
  tariff_codes: string[];
}

export default function FraudCasesPage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();
  const [cases, setCases] = useState<FraudCase[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<FraudCase | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFraudCases();
    }
  }, [isAuthenticated]);

  const fetchFraudCases = async () => {
    try {
      setLoadingCases(true);
      const response = await fetch('/api/claims-assessor/fraud');
      const data = await response.json();
      setCases(data.cases || []);
    } catch (error) {
      console.error('Error fetching fraud cases:', error);
    } finally {
      setLoadingCases(false);
    }
  };

  const handleClearFraud = async () => {
    if (!selectedCase) return;

    try {
      await fetch(`/api/claims-assessor/fraud/${selectedCase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cleared',
          fraud_review_status: 'cleared',
          fraud_review_notes: reviewNotes || 'Fraud alert cleared after review',
          fraud_alert_triggered: false
        })
      });
      fetchFraudCases();
      setShowDetails(false);
      setSelectedCase(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error clearing fraud alert:', error);
    }
  };

  const handleConfirmFraud = async () => {
    if (!selectedCase) return;

    try {
      await fetch(`/api/claims-assessor/fraud/${selectedCase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirmed',
          fraud_review_status: 'confirmed',
          fraud_review_notes: reviewNotes || 'Fraud confirmed - claim rejected',
          status: 'rejected',
          rejection_code: 'R10',
          rejection_reason: 'Fraudulent claim detected'
        })
      });
      fetchFraudCases();
      setShowDetails(false);
      setSelectedCase(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error confirming fraud:', error);
    }
  };

  const handleEscalate = async () => {
    if (!selectedCase) return;

    try {
      await fetch(`/api/claims-assessor/fraud/${selectedCase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'escalated',
          fraud_review_status: 'escalated',
          fraud_review_notes: reviewNotes || 'Case escalated to fraud investigation unit'
        })
      });
      fetchFraudCases();
      setShowDetails(false);
      setSelectedCase(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error escalating case:', error);
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

  const filteredCases = cases.filter(c => 
    c.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.member?.first_name + ' ' + c.member?.last_name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingReview = filteredCases.filter(c => !c.fraud_review_status || c.fraud_review_status === 'pending');
  const highRisk = filteredCases.filter(c => (c.fraud_risk_score || 0) > 70);
  const escalated = filteredCases.filter(c => c.fraud_review_status === 'escalated');

  const getRiskBadge = (score: number | null) => {
    if (!score) return <span className="text-xs text-gray-500">N/A</span>;
    
    if (score >= 80) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        High Risk ({score})
      </span>;
    } else if (score >= 50) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        Medium Risk ({score})
      </span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Low Risk ({score})
      </span>;
    }
  };

  const getReviewStatusBadge = (status: string | null) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      cleared: 'bg-green-100 text-green-800',
      confirmed: 'bg-red-100 text-red-800',
      escalated: 'bg-purple-100 text-purple-800',
    };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status || 'pending'] || 'bg-gray-100 text-gray-800'}`}>
      {(status || 'pending').toUpperCase()}
    </span>;
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fraud Cases</h1>
          <p className="text-gray-600 mt-1">Investigate and review claims flagged for potential fraud</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-600">{pendingReview.length}</p>
                  <p className="text-xs text-gray-600 mt-1">Awaiting investigation</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High Risk</p>
                  <p className="text-3xl font-bold mt-1 text-red-600">{highRisk.length}</p>
                  <p className="text-xs text-gray-600 mt-1">Score &gt; 70</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Escalated</p>
                  <p className="text-3xl font-bold mt-1 text-purple-600">{escalated.length}</p>
                  <p className="text-xs text-gray-600 mt-1">Under investigation</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <Input 
              placeholder="Search by claim number or member name..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Cases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Fraud Cases</CardTitle>
            <CardDescription>Showing {filteredCases.length} cases</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCases ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading cases...</p>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No fraud cases found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Claim Number</th>
                      <th className="text-left py-3 px-4 font-medium">Member</th>
                      <th className="text-left py-3 px-4 font-medium">Provider</th>
                      <th className="text-right py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Risk Score</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map((fraudCase) => (
                      <tr key={fraudCase.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <p className="font-mono text-sm">{fraudCase.claim_number}</p>
                          </div>
                          <p className="text-xs text-gray-500">{new Date(fraudCase.submission_date).toLocaleString()}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">
                            {fraudCase.member?.first_name} {fraudCase.member?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{fraudCase.member?.member_number}</p>
                        </td>
                        <td className="py-3 px-4">{fraudCase.provider?.name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          R{parseFloat(fraudCase.claimed_amount).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">{getRiskBadge(fraudCase.fraud_risk_score)}</td>
                        <td className="py-3 px-4">{getReviewStatusBadge(fraudCase.fraud_review_status)}</td>
                        <td className="py-3 px-4">
                          <Button 
                            size="sm" 
                            onClick={() => { 
                              setSelectedCase(fraudCase); 
                              setShowDetails(true);
                              setReviewNotes(fraudCase.fraud_review_notes || '');
                            }}
                          >
                            Investigate
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Case Details Modal */}
        {showDetails && selectedCase && (
          <Card className="border-2 border-red-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Fraud Investigation
                  </CardTitle>
                  <CardDescription>{selectedCase.claim_number}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-800 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <p className="font-medium">Fraud Alert Triggered</p>
                  </div>
                  <p className="text-sm text-red-700">
                    This claim has been flagged by our fraud detection system. Please review carefully before processing.
                  </p>
                  {selectedCase.fraud_risk_score && (
                    <p className="text-sm text-red-700 mt-1">
                      <strong>Risk Score:</strong> {selectedCase.fraud_risk_score}/100
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Member</p>
                    <p className="font-medium">
                      {selectedCase.member?.first_name} {selectedCase.member?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{selectedCase.member?.member_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Provider</p>
                    <p className="font-medium">{selectedCase.provider?.name}</p>
                    <p className="text-xs text-gray-500">{selectedCase.provider?.provider_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Service Date</p>
                    <p className="font-medium">{new Date(selectedCase.service_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Claimed Amount</p>
                    <p className="font-medium">R{parseFloat(selectedCase.claimed_amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Claim Type</p>
                    <p className="font-medium">{selectedCase.claim_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Review Status</p>
                    <p className="font-medium">{getReviewStatusBadge(selectedCase.fraud_review_status)}</p>
                  </div>
                  {selectedCase.icd10_codes?.length > 0 && (
                    <div>
                      <p className="text-gray-600">ICD-10 Codes</p>
                      <p className="font-medium">{selectedCase.icd10_codes.join(', ')}</p>
                    </div>
                  )}
                  {selectedCase.tariff_codes?.length > 0 && (
                    <div>
                      <p className="text-gray-600">Tariff Codes</p>
                      <p className="font-medium">{selectedCase.tariff_codes.join(', ')}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Investigation Notes</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Enter your investigation findings..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={handleClearFraud}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Clear Alert
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleEscalate}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Escalate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                    onClick={handleConfirmFraud}
                  >
                    Confirm Fraud
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarLayout>
  );
}
