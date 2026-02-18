'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Claim {
  claimNumber: string;
  patientName: string;
  memberNumber: string;
  serviceDate: string;
  submissionDate: string;
  claimType: string;
  amount: number;
  approvedAmount: number;
  status: 'submitted' | 'pending' | 'approved' | 'paid' | 'rejected' | 'pended';
  statusDate: string;
}

export default function ClaimsHistoryPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Mock data
  const [claims] = useState<Claim[]>([
    {
      claimNumber: 'CLM-20240110-001234',
      patientName: 'John Smith',
      memberNumber: 'M-2024-5678',
      serviceDate: '2024-01-08',
      submissionDate: '2024-01-10',
      claimType: 'Consultation',
      amount: 850.0,
      approvedAmount: 850.0,
      status: 'paid',
      statusDate: '2024-01-11',
    },
    {
      claimNumber: 'CLM-20240109-001189',
      patientName: 'Jane Doe',
      memberNumber: 'M-2024-3421',
      serviceDate: '2024-01-07',
      submissionDate: '2024-01-09',
      claimType: 'Procedure',
      amount: 3500.0,
      approvedAmount: 3150.0,
      status: 'approved',
      statusDate: '2024-01-10',
    },
    {
      claimNumber: 'CLM-20240108-001156',
      patientName: 'Bob Johnson',
      memberNumber: 'M-2024-7890',
      serviceDate: '2024-01-06',
      submissionDate: '2024-01-08',
      claimType: 'Pathology',
      amount: 1200.0,
      approvedAmount: 0,
      status: 'pending',
      statusDate: '2024-01-08',
    },
    {
      claimNumber: 'CLM-20240107-001123',
      patientName: 'Alice Williams',
      memberNumber: 'M-2024-4567',
      serviceDate: '2024-01-05',
      submissionDate: '2024-01-07',
      claimType: 'Radiology',
      amount: 2800.0,
      approvedAmount: 0,
      status: 'pended',
      statusDate: '2024-01-09',
    },
    {
      claimNumber: 'CLM-20240106-001098',
      patientName: 'Charlie Brown',
      memberNumber: 'M-2024-2345',
      serviceDate: '2024-01-04',
      submissionDate: '2024-01-06',
      claimType: 'Consultation',
      amount: 750.0,
      approvedAmount: 0,
      status: 'rejected',
      statusDate: '2024-01-08',
    },
    {
      claimNumber: 'CLM-20240105-001067',
      patientName: 'Diana Prince',
      memberNumber: 'M-2024-6789',
      serviceDate: '2024-01-03',
      submissionDate: '2024-01-05',
      claimType: 'Hospitalization',
      amount: 15000.0,
      approvedAmount: 15000.0,
      status: 'paid',
      statusDate: '2024-01-10',
    },
  ]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusBadge = (status: Claim['status']) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      paid: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pended: 'bg-orange-100 text-orange-800',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.memberNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;

    const matchesDateFrom = !dateFrom || claim.serviceDate >= dateFrom;
    const matchesDateTo = !dateTo || claim.serviceDate <= dateTo;

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const stats = {
    total: claims.length,
    pending: claims.filter((c) => c.status === 'pending').length,
    approved: claims.filter((c) => c.status === 'approved').length,
    paid: claims.filter((c) => c.status === 'paid').length,
    rejected: claims.filter((c) => c.status === 'rejected').length,
    totalAmount: claims.reduce((sum, c) => sum + c.amount, 0),
    approvedAmount: claims.reduce((sum, c) => sum + c.approvedAmount, 0),
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Claims History</h1>
            <p className="text-gray-600 mt-1">View and track all submitted claims</p>
          </div>
          <Button onClick={() => router.push('/provider/claims/submit')}>
            + Submit New Claim
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Claims</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.paid}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Submitted</p>
                <p className="text-2xl font-bold mt-1">R{stats.totalAmount.toLocaleString()}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Search
                </label>
                <Input
                  id="search"
                  placeholder="Claim number, patient, member..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="rejected">Rejected</option>
                  <option value="pended">Pended</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="dateFrom" className="text-sm font-medium">
                  Date From
                </label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="dateTo" className="text-sm font-medium">
                  Date To
                </label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Claims List</CardTitle>
                <CardDescription>
                  Showing {filteredClaims.length} of {claims.length} claims
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Export to CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Claim Number</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Patient</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Service Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Approved</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No claims found matching your filters
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((claim) => (
                      <tr key={claim.claimNumber} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-mono text-sm">{claim.claimNumber}</p>
                          <p className="text-xs text-gray-500">
                            Submitted: {new Date(claim.submissionDate).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">{claim.patientName}</p>
                          <p className="text-xs text-gray-500">{claim.memberNumber}</p>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(claim.serviceDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">{claim.claimType}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          R{claim.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {claim.approvedAmount > 0 ? (
                            <span className="text-green-600">
                              R{claim.approvedAmount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(claim.status)}</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Status Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Status Definitions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge('submitted')}
                  <span className="font-medium">Submitted</span>
                </div>
                <p className="text-gray-600">Claim received, awaiting initial review</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge('pending')}
                  <span className="font-medium">Pending</span>
                </div>
                <p className="text-gray-600">Under review by claims assessor</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge('pended')}
                  <span className="font-medium">Pended</span>
                </div>
                <p className="text-gray-600">Additional information required</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge('approved')}
                  <span className="font-medium">Approved</span>
                </div>
                <p className="text-gray-600">Claim approved, payment scheduled</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge('paid')}
                  <span className="font-medium">Paid</span>
                </div>
                <p className="text-gray-600">Payment processed and completed</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge('rejected')}
                  <span className="font-medium">Rejected</span>
                </div>
                <p className="text-gray-600">Claim rejected, appeal available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
