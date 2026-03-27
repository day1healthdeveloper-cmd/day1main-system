'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, AlertTriangle } from 'lucide-react';

interface Claim {
  id: string;
  claim_number: string;
  member: { first_name: string; last_name: string; member_number: string } | null;
  provider: { name: string; provider_number: string } | null;
  service_date: string;
  claim_type: string;
  claimed_amount: string;
  status: string;
  submission_date: string;
  icd10_codes: string[];
  tariff_codes: string[];
  fraud_alert_triggered: boolean;
  is_pmb: boolean;
}

export default function ClaimsQueuePage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchClaims();
    }
  }, [statusFilter, isAuthenticated]);

  const fetchClaims = async () => {
    try {
      setLoadingClaims(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`/api/claims-assessor/queue?${params}`);
      const data = await response.json();
      setClaims(data.claims || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoadingClaims(false);
    }
  };

  const handleAction = async (claimId: string, action: string, status: string) => {
    try {
      await fetch(`/api/claims-assessor/queue/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          status,
          ...(status === 'approved' && { 
            approved_at: new Date().toISOString(),
            approved_amount: selectedClaim?.claimed_amount 
          }),
          ...(status === 'pended' && { 
            pended_date: new Date().toISOString(),
            pended_reason: 'Additional information required' 
          }),
          ...(status === 'rejected' && { 
            rejection_code: 'R09',
            rejection_reason: 'Service excluded from coverage' 
          })
        })
      });
      fetchClaims();
      setShowDetails(false);
      setSelectedClaim(null);
    } catch (error) {
      console.error(`Error ${action} claim:`, error);
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

  const filteredClaims = claims.filter(claim => 
    claim.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (claim.member?.first_name + ' ' + claim.member?.last_name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      pended: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.toUpperCase()}
    </span>;
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claims Queue</h1>
          <p className="text-gray-600 mt-1">Review and adjudicate pending claims</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">
                  {claims.filter(c => c.status === 'pending').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Pended</p>
                <p className="text-3xl font-bold mt-1 text-orange-600">
                  {claims.filter(c => c.status === 'pended').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">High Value</p>
                <p className="text-3xl font-bold mt-1 text-red-600">
                  {claims.filter(c => parseFloat(c.claimed_amount) > 50000).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">PMB Claims</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">
                  {claims.filter(c => c.is_pmb).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input 
                  placeholder="Claim number, member name..." 
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
                  <option value="pending">Pending</option>
                  <option value="pended">Pended</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle>Claims Queue</CardTitle>
            <CardDescription>Showing {filteredClaims.length} claims</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingClaims ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading claims...</p>
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No claims found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Claim Number</th>
                      <th className="text-left py-3 px-4 font-medium">Member</th>
                      <th className="text-left py-3 px-4 font-medium">Provider</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-right py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.map((claim) => (
                      <tr key={claim.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm">{claim.claim_number}</p>
                            {claim.fraud_alert_triggered && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            {claim.is_pmb && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">PMB</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{new Date(claim.submission_date).toLocaleString()}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">
                            {claim.member?.first_name} {claim.member?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{claim.member?.member_number}</p>
                        </td>
                        <td className="py-3 px-4">{claim.provider?.name || 'Unknown'}</td>
                        <td className="py-3 px-4">{claim.claim_type}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          R{parseFloat(claim.claimed_amount).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(claim.status)}</td>
                        <td className="py-3 px-4">
                          <Button 
                            size="sm" 
                            onClick={() => { 
                              setSelectedClaim(claim); 
                              setShowDetails(true); 
                            }}
                          >
                            Review
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

        {/* Claim Details Modal */}
        {showDetails && selectedClaim && (
          <Card className="border-2 border-green-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Claim Review</CardTitle>
                  <CardDescription>{selectedClaim.claim_number}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Member</p>
                    <p className="font-medium">
                      {selectedClaim.member?.first_name} {selectedClaim.member?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{selectedClaim.member?.member_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Provider</p>
                    <p className="font-medium">{selectedClaim.provider?.name}</p>
                    <p className="text-xs text-gray-500">{selectedClaim.provider?.provider_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Service Date</p>
                    <p className="font-medium">{new Date(selectedClaim.service_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Claimed Amount</p>
                    <p className="font-medium">R{parseFloat(selectedClaim.claimed_amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Claim Type</p>
                    <p className="font-medium">{selectedClaim.claim_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-medium">{getStatusBadge(selectedClaim.status)}</p>
                  </div>
                  {selectedClaim.icd10_codes?.length > 0 && (
                    <div>
                      <p className="text-gray-600">ICD-10 Codes</p>
                      <p className="font-medium">{selectedClaim.icd10_codes.join(', ')}</p>
                    </div>
                  )}
                  {selectedClaim.tariff_codes?.length > 0 && (
                    <div>
                      <p className="text-gray-600">Tariff Codes</p>
                      <p className="font-medium">{selectedClaim.tariff_codes.join(', ')}</p>
                    </div>
                  )}
                </div>

                {selectedClaim.fraud_alert_triggered && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="w-5 h-5" />
                      <p className="font-medium">Fraud Alert Triggered</p>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      This claim has been flagged for potential fraud. Please review carefully.
                    </p>
                  </div>
                )}

                {selectedClaim.is_pmb && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>PMB Claim:</strong> This is a Prescribed Minimum Benefit claim and must be covered according to regulations.
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button 
                    size="sm" 
                    onClick={() => handleAction(selectedClaim.id, 'approved', 'approved')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleAction(selectedClaim.id, 'pended', 'pended')}
                  >
                    Pend for Info
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleAction(selectedClaim.id, 'rejected', 'rejected')}
                  >
                    Reject
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
