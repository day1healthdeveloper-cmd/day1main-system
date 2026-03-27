'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface PreAuthRequest {
  id: string;
  claim_number: string;
  member: { first_name: string; last_name: string; member_number: string } | null;
  provider: { name: string; provider_number: string } | null;
  service_date: string;
  claim_type: string;
  claimed_amount: string;
  status: string;
  submission_date: string;
  pre_auth_number: string | null;
  pre_auth_required: boolean;
  icd10_codes: string[];
  tariff_codes: string[];
  is_pmb: boolean;
}

export default function PreAuthQueuePage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<PreAuthRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<PreAuthRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [authNumber, setAuthNumber] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPreAuthRequests();
    }
  }, [isAuthenticated]);

  const fetchPreAuthRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await fetch('/api/claims-assessor/preauth');
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching pre-auth requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !authNumber.trim()) {
      alert('Please enter an authorization number');
      return;
    }

    try {
      await fetch(`/api/claims-assessor/preauth/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approved',
          pre_auth_number: authNumber,
          status: 'approved'
        })
      });
      fetchPreAuthRequests();
      setShowDetails(false);
      setSelectedRequest(null);
      setAuthNumber('');
    } catch (error) {
      console.error('Error approving pre-auth:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      await fetch(`/api/claims-assessor/preauth/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rejected',
          status: 'rejected',
          rejection_code: 'R04',
          rejection_reason: 'Pre-authorization denied - medical necessity not established'
        })
      });
      fetchPreAuthRequests();
      setShowDetails(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting pre-auth:', error);
    }
  };

  const handlePend = async () => {
    if (!selectedRequest) return;

    try {
      await fetch(`/api/claims-assessor/preauth/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pended',
          status: 'pended',
          pended_date: new Date().toISOString(),
          pended_reason: 'Additional clinical information required'
        })
      });
      fetchPreAuthRequests();
      setShowDetails(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error pending pre-auth:', error);
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

  const filteredRequests = requests.filter(req => 
    req.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.member?.first_name + ' ' + req.member?.last_name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
  const approvedToday = filteredRequests.filter(r => {
    if (r.status !== 'approved') return false;
    const today = new Date().setHours(0, 0, 0, 0);
    const submissionDate = new Date(r.submission_date).setHours(0, 0, 0, 0);
    return submissionDate === today;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Pre-Authorization Queue</h1>
          <p className="text-gray-600 mt-1">Review and authorize hospital admissions and procedures</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-600">{pendingRequests.length}</p>
                  <p className="text-xs text-gray-600 mt-1">Awaiting authorization</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved Today</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{approvedToday.length}</p>
                  <p className="text-xs text-gray-600 mt-1">Authorizations issued</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High Value</p>
                  <p className="text-3xl font-bold mt-1 text-red-600">
                    {filteredRequests.filter(r => parseFloat(r.claimed_amount) > 50000).length}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Over R50,000</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Input 
              placeholder="Search by claim number or member name..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pre-Authorization Requests</CardTitle>
            <CardDescription>Showing {filteredRequests.length} requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRequests ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No pre-authorization requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Request Number</th>
                      <th className="text-left py-3 px-4 font-medium">Member</th>
                      <th className="text-left py-3 px-4 font-medium">Provider</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-right py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm">{request.claim_number}</p>
                            {request.is_pmb && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">PMB</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{new Date(request.submission_date).toLocaleString()}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">
                            {request.member?.first_name} {request.member?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{request.member?.member_number}</p>
                        </td>
                        <td className="py-3 px-4">{request.provider?.name || 'Unknown'}</td>
                        <td className="py-3 px-4">{request.claim_type}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          R{parseFloat(request.claimed_amount).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                        <td className="py-3 px-4">
                          <Button 
                            size="sm" 
                            onClick={() => { 
                              setSelectedRequest(request); 
                              setShowDetails(true);
                              setAuthNumber(request.pre_auth_number || '');
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

        {/* Request Details Modal */}
        {showDetails && selectedRequest && (
          <Card className="border-2 border-yellow-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pre-Authorization Review</CardTitle>
                  <CardDescription>{selectedRequest.claim_number}</CardDescription>
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
                      {selectedRequest.member?.first_name} {selectedRequest.member?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{selectedRequest.member?.member_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Provider</p>
                    <p className="font-medium">{selectedRequest.provider?.name}</p>
                    <p className="text-xs text-gray-500">{selectedRequest.provider?.provider_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Service Date</p>
                    <p className="font-medium">{new Date(selectedRequest.service_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estimated Amount</p>
                    <p className="font-medium">R{parseFloat(selectedRequest.claimed_amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Procedure Type</p>
                    <p className="font-medium">{selectedRequest.claim_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-medium">{getStatusBadge(selectedRequest.status)}</p>
                  </div>
                  {selectedRequest.icd10_codes?.length > 0 && (
                    <div>
                      <p className="text-gray-600">ICD-10 Codes</p>
                      <p className="font-medium">{selectedRequest.icd10_codes.join(', ')}</p>
                    </div>
                  )}
                  {selectedRequest.tariff_codes?.length > 0 && (
                    <div>
                      <p className="text-gray-600">Tariff Codes</p>
                      <p className="font-medium">{selectedRequest.tariff_codes.join(', ')}</p>
                    </div>
                  )}
                </div>

                {selectedRequest.is_pmb && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>PMB Request:</strong> This is a Prescribed Minimum Benefit and must be authorized according to regulations.
                    </p>
                  </div>
                )}

                {selectedRequest.status === 'pending' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Authorization Number</label>
                      <Input 
                        placeholder="Enter authorization number (e.g., AUTH-2026-001)" 
                        value={authNumber}
                        onChange={(e) => setAuthNumber(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={handleApprove}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Authorize
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handlePend}
                      >
                        Request More Info
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700"
                        onClick={handleReject}
                      >
                        Deny
                      </Button>
                    </div>
                  </div>
                )}

                {selectedRequest.pre_auth_number && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Authorization Number:</strong> {selectedRequest.pre_auth_number}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarLayout>
  );
}
