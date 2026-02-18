'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Claim {
  id: string;
  claimNumber: string;
  memberName: string;
  memberNumber: string;
  providerName: string;
  serviceDate: string;
  claimType: string;
  claimedAmount: number;
  status: 'pending' | 'pended' | 'approved' | 'rejected';
  submissionDate: string;
  assignedTo?: string;
}

export default function AdminClaimsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showClaimDetails, setShowClaimDetails] = useState(false);

  const [claims] = useState<Claim[]>([
    {
      id: '1',
      claimNumber: 'CLM-20240111-001',
      memberName: 'John Smith',
      memberNumber: 'M-2024-1247',
      providerName: 'Dr. Sarah Johnson',
      serviceDate: '2024-01-10',
      claimType: 'Consultation',
      claimedAmount: 850.0,
      status: 'pending',
      submissionDate: '2024-01-11T09:00:00',
    },
    {
      id: '2',
      claimNumber: 'CLM-20240111-002',
      memberName: 'Jane Doe',
      memberNumber: 'M-2024-1246',
      providerName: 'Cape Town Hospital',
      serviceDate: '2024-01-09',
      claimType: 'Hospitalization',
      claimedAmount: 125000.0,
      status: 'pending',
      submissionDate: '2024-01-11T08:30:00',
      assignedTo: 'Senior Assessor',
    },
  ]);

  // Disabled auth check for demo
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [loading, isAuthenticated, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  const getStatusBadge = (status: Claim['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      pended: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>{status.toUpperCase()}</span>;
  };

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch = claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) || claim.memberName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claims Workbench</h1>
          <p className="text-gray-600 mt-1">Review and adjudicate pending claims</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{claims.filter(c => c.status === 'pending').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Pended</p>
                <p className="text-3xl font-bold mt-1 text-orange-600">{claims.filter(c => c.status === 'pended').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">High Value</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{claims.filter(c => c.claimedAmount > 50000).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Avg Processing Time</p>
                <p className="text-3xl font-bold mt-1">2.3h</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input placeholder="Claim number, member name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="pended">Pended</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claims Queue</CardTitle>
            <CardDescription>Showing {filteredClaims.length} claims</CardDescription>
          </CardHeader>
          <CardContent>
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
                        <p className="font-mono text-sm">{claim.claimNumber}</p>
                        <p className="text-xs text-gray-500">{new Date(claim.submissionDate).toLocaleString()}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{claim.memberName}</p>
                        <p className="text-xs text-gray-500">{claim.memberNumber}</p>
                      </td>
                      <td className="py-3 px-4">{claim.providerName}</td>
                      <td className="py-3 px-4">{claim.claimType}</td>
                      <td className="py-3 px-4 text-right font-medium">R{claim.claimedAmount.toLocaleString()}</td>
                      <td className="py-3 px-4">{getStatusBadge(claim.status)}</td>
                      <td className="py-3 px-4">
                        <Button size="sm" onClick={() => { setSelectedClaim(claim); setShowClaimDetails(true); }}>Review</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {showClaimDetails && selectedClaim && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Claim Review</CardTitle>
                  <CardDescription>{selectedClaim.claimNumber}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowClaimDetails(false)}>Close</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-600">Member</p><p className="font-medium">{selectedClaim.memberName}</p></div>
                  <div><p className="text-gray-600">Provider</p><p className="font-medium">{selectedClaim.providerName}</p></div>
                  <div><p className="text-gray-600">Service Date</p><p className="font-medium">{new Date(selectedClaim.serviceDate).toLocaleDateString()}</p></div>
                  <div><p className="text-gray-600">Claimed Amount</p><p className="font-medium">R{selectedClaim.claimedAmount.toLocaleString()}</p></div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button size="sm">Approve</Button>
                  <Button size="sm" variant="outline">Pend for Info</Button>
                  <Button size="sm" variant="outline" className="text-red-600">Reject</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarLayout>
  );
}
