'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Policy {
  id: string;
  policyNumber: string;
  memberName: string;
  memberNumber: string;
  product: string;
  status: 'active' | 'lapsed' | 'cancelled' | 'pending';
  startDate: string;
  renewalDate: string;
  monthlyPremium: number;
  lastPaymentDate?: string;
  lapseReason?: string;
}

export default function AdminPoliciesPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);
  const [showEndorsementForm, setShowEndorsementForm] = useState(false);

  const [policies] = useState<Policy[]>([
    {
      id: '1',
      policyNumber: 'POL-20240108-001',
      memberName: 'John Smith',
      memberNumber: 'M-2024-1247',
      product: 'Premium Plan',
      status: 'active',
      startDate: '2024-01-08',
      renewalDate: '2025-01-08',
      monthlyPremium: 2500.0,
      lastPaymentDate: '2024-01-08',
    },
    {
      id: '2',
      policyNumber: 'POL-20240105-045',
      memberName: 'Jane Doe',
      memberNumber: 'M-2024-1246',
      product: 'Family Plan',
      status: 'active',
      startDate: '2024-01-05',
      renewalDate: '2025-01-05',
      monthlyPremium: 3200.0,
      lastPaymentDate: '2024-01-05',
    },
    {
      id: '3',
      policyNumber: 'POL-20231215-123',
      memberName: 'Bob Johnson',
      memberNumber: 'M-2023-0987',
      product: 'Standard Plan',
      status: 'lapsed',
      startDate: '2023-12-15',
      renewalDate: '2024-12-15',
      monthlyPremium: 1800.0,
      lastPaymentDate: '2023-12-15',
      lapseReason: 'Non-payment - 3 failed debit orders',
    },
  ]);

  // Disabled auth check for demo
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [loading, isAuthenticated, router]);

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

  const getStatusBadge = (status: Policy['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      lapsed: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.memberNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: policies.length,
    active: policies.filter((p) => p.status === 'active').length,
    lapsed: policies.filter((p) => p.status === 'lapsed').length,
    cancelled: policies.filter((p) => p.status === 'cancelled').length,
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Policy Administration</h1>
          <p className="text-gray-600 mt-1">Manage policies, endorsements, and reinstatements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Policies</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Lapsed</p>
                <p className="text-3xl font-bold mt-1 text-orange-600">{stats.lapsed}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.cancelled}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">Search</label>
                <Input
                  id="search"
                  placeholder="Policy number, member name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="statusFilter" className="text-sm font-medium">Status</label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="lapsed">Lapsed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policies List</CardTitle>
            <CardDescription>Showing {filteredPolicies.length} of {policies.length} policies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Policy Number</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Member</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Premium</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPolicies.map((policy) => (
                    <tr key={policy.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-mono text-sm">{policy.policyNumber}</p>
                        <p className="text-xs text-gray-500">Start: {new Date(policy.startDate).toLocaleDateString()}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{policy.memberName}</p>
                        <p className="text-xs text-gray-500">{policy.memberNumber}</p>
                      </td>
                      <td className="py-3 px-4">{policy.product}</td>
                      <td className="py-3 px-4 text-right font-medium">R{policy.monthlyPremium.toFixed(2)}/mo</td>
                      <td className="py-3 px-4">{getStatusBadge(policy.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedPolicy(policy);
                            setShowPolicyDetails(true);
                          }}>
                            View
                          </Button>
                          {policy.status === 'lapsed' && (
                            <Button size="sm" variant="outline">Reinstate</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {showPolicyDetails && selectedPolicy && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Policy Details</CardTitle>
                  <CardDescription>{selectedPolicy.policyNumber}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPolicyDetails(false)}>Close</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Member</p>
                    <p className="font-medium">{selectedPolicy.memberName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Product</p>
                    <p className="font-medium">{selectedPolicy.product}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedPolicy.status)}</div>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly Premium</p>
                    <p className="font-medium">R{selectedPolicy.monthlyPremium.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Start Date</p>
                    <p className="font-medium">{new Date(selectedPolicy.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Renewal Date</p>
                    <p className="font-medium">{new Date(selectedPolicy.renewalDate).toLocaleDateString()}</p>
                  </div>
                </div>
                {selectedPolicy.lapseReason && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-sm font-medium text-orange-900">Lapse Reason</p>
                    <p className="text-sm text-orange-700">{selectedPolicy.lapseReason}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button size="sm" onClick={() => setShowEndorsementForm(true)}>Process Endorsement</Button>
                  <Button size="sm" variant="outline">View Claims</Button>
                  <Button size="sm" variant="outline">View Payments</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showEndorsementForm && (
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Process Endorsement</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowEndorsementForm(false)}>Cancel</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Endorsement Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Add Dependant</option>
                    <option>Remove Dependant</option>
                    <option>Change Product</option>
                    <option>Update Contact Details</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
                </div>
                <Button>Submit Endorsement</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarLayout>
  );
}
