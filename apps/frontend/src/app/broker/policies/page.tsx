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
  memberEmail: string;
  memberPhone: string;
  product: string;
  monthlyPremium: number;
  coverAmount: number;
  dependants: number;
  status: 'active' | 'lapsed' | 'cancelled' | 'pending';
  startDate: string;
  renewalDate: string;
  lastPaymentDate?: string;
  commissionRate: number;
  monthlyCommission: number;
}

export default function BrokerPoliciesPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);

  // Mock policies data
  const [policies] = useState<Policy[]>([
    {
      id: '1',
      policyNumber: 'POL-20240108-001',
      memberName: 'Charlie Brown',
      memberEmail: 'charlie.b@email.com',
      memberPhone: '0855556666',
      product: 'Basic Plan',
      monthlyPremium: 1500.0,
      coverAmount: 250000.0,
      dependants: 1,
      status: 'active',
      startDate: '2024-01-08',
      renewalDate: '2025-01-08',
      lastPaymentDate: '2024-01-08',
      commissionRate: 15,
      monthlyCommission: 225.0,
    },
    {
      id: '2',
      policyNumber: 'POL-20240105-045',
      memberName: 'Jane Doe',
      memberEmail: 'jane.doe@email.com',
      memberPhone: '0827654321',
      product: 'Family Plan',
      monthlyPremium: 3200.0,
      coverAmount: 750000.0,
      dependants: 4,
      status: 'active',
      startDate: '2024-01-05',
      renewalDate: '2025-01-05',
      lastPaymentDate: '2024-01-05',
      commissionRate: 15,
      monthlyCommission: 480.0,
    },
    {
      id: '3',
      policyNumber: 'POL-20231215-123',
      memberName: 'Bob Johnson',
      memberEmail: 'bob.j@email.com',
      memberPhone: '0831112222',
      product: 'Standard Plan',
      monthlyPremium: 1800.0,
      coverAmount: 300000.0,
      dependants: 2,
      status: 'active',
      startDate: '2023-12-15',
      renewalDate: '2024-12-15',
      lastPaymentDate: '2024-01-01',
      commissionRate: 15,
      monthlyCommission: 270.0,
    },
    {
      id: '4',
      policyNumber: 'POL-20231201-098',
      memberName: 'Alice Williams',
      memberEmail: 'alice.w@email.com',
      memberPhone: '0843334444',
      product: 'Premium Plan',
      monthlyPremium: 2800.0,
      coverAmount: 600000.0,
      dependants: 3,
      status: 'lapsed',
      startDate: '2023-12-01',
      renewalDate: '2024-12-01',
      lastPaymentDate: '2023-12-01',
      commissionRate: 15,
      monthlyCommission: 420.0,
    },
    {
      id: '5',
      policyNumber: 'POL-20231110-067',
      memberName: 'David Smith',
      memberEmail: 'david.s@email.com',
      memberPhone: '0867778888',
      product: 'Premium Plan',
      monthlyPremium: 2500.0,
      coverAmount: 500000.0,
      dependants: 3,
      status: 'active',
      startDate: '2023-11-10',
      renewalDate: '2024-11-10',
      lastPaymentDate: '2024-01-10',
      commissionRate: 15,
      monthlyCommission: 375.0,
    },
    {
      id: '6',
      policyNumber: 'POL-20231020-045',
      memberName: 'Emma Wilson',
      memberEmail: 'emma.w@email.com',
      memberPhone: '0879990000',
      product: 'Standard Plan',
      monthlyPremium: 1600.0,
      coverAmount: 280000.0,
      dependants: 1,
      status: 'cancelled',
      startDate: '2023-10-20',
      renewalDate: '2024-10-20',
      lastPaymentDate: '2023-12-20',
      commissionRate: 15,
      monthlyCommission: 240.0,
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

  const getStatusBadge = (status: Policy['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      lapsed: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.memberEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    const matchesProduct = productFilter === 'all' || policy.product === productFilter;

    return matchesSearch && matchesStatus && matchesProduct;
  });

  const stats = {
    total: policies.length,
    active: policies.filter((p) => p.status === 'active').length,
    lapsed: policies.filter((p) => p.status === 'lapsed').length,
    cancelled: policies.filter((p) => p.status === 'cancelled').length,
    totalPremium: policies
      .filter((p) => p.status === 'active')
      .reduce((sum, p) => sum + p.monthlyPremium, 0),
    totalCommission: policies
      .filter((p) => p.status === 'active')
      .reduce((sum, p) => sum + p.monthlyCommission, 0),
    annualCommission: policies
      .filter((p) => p.status === 'active')
      .reduce((sum, p) => sum + p.monthlyCommission * 12, 0),
  };

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowPolicyDetails(true);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Policies</h1>
          <p className="text-gray-600 mt-1">View and manage your active policies</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Lapsed</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{stats.lapsed}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{stats.cancelled}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Premium/mo</p>
                <p className="text-xl font-bold mt-1">R{stats.totalPremium.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Comm/mo</p>
                <p className="text-xl font-bold mt-1 text-green-600">
                  R{stats.totalCommission.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Search
                </label>
                <Input
                  id="search"
                  placeholder="Policy number, member name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="statusFilter" className="text-sm font-medium">
                  Status
                </label>
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
              <div className="space-y-2">
                <label htmlFor="productFilter" className="text-sm font-medium">
                  Product
                </label>
                <select
                  id="productFilter"
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Products</option>
                  <option value="Premium Plan">Premium Plan</option>
                  <option value="Family Plan">Family Plan</option>
                  <option value="Standard Plan">Standard Plan</option>
                  <option value="Basic Plan">Basic Plan</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policies Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Policies List</CardTitle>
                <CardDescription>
                  Showing {filteredPolicies.length} of {policies.length} policies
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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Policy Number
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Member</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Premium</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Commission</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPolicies.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        No policies found matching your filters
                      </td>
                    </tr>
                  ) : (
                    filteredPolicies.map((policy) => (
                      <tr key={policy.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-mono text-sm">{policy.policyNumber}</p>
                          <p className="text-xs text-gray-500">
                            Start: {new Date(policy.startDate).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">{policy.memberName}</p>
                          <p className="text-xs text-gray-500">{policy.memberEmail}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p>{policy.product}</p>
                          <p className="text-xs text-gray-500">{policy.dependants} dependants</p>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          R{policy.monthlyPremium.toFixed(2)}/mo
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">
                          R{policy.monthlyCommission.toFixed(2)}/mo
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(policy.status)}</td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPolicy(policy)}
                          >
                            View
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

        {/* Policy Details Modal */}
        {showPolicyDetails && selectedPolicy && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Policy Details</CardTitle>
                  <CardDescription>{selectedPolicy.policyNumber}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPolicyDetails(false)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Member Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Member Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p className="font-medium">{selectedPolicy.memberName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">{selectedPolicy.memberEmail}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">{selectedPolicy.memberPhone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Dependants</p>
                      <p className="font-medium">{selectedPolicy.dependants}</p>
                    </div>
                  </div>
                </div>

                {/* Policy Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Policy Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Product</p>
                      <p className="font-medium">{selectedPolicy.product}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedPolicy.status)}</div>
                    </div>
                    <div>
                      <p className="text-gray-600">Cover Amount</p>
                      <p className="font-medium">R{selectedPolicy.coverAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monthly Premium</p>
                      <p className="font-medium">R{selectedPolicy.monthlyPremium.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Start Date</p>
                      <p className="font-medium">
                        {new Date(selectedPolicy.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Renewal Date</p>
                      <p className="font-medium">
                        {new Date(selectedPolicy.renewalDate).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedPolicy.lastPaymentDate && (
                      <div>
                        <p className="text-gray-600">Last Payment</p>
                        <p className="font-medium">
                          {new Date(selectedPolicy.lastPaymentDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Commission Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Commission Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Commission Rate</p>
                      <p className="font-medium">{selectedPolicy.commissionRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monthly Commission</p>
                      <p className="font-medium text-green-600">
                        R{selectedPolicy.monthlyCommission.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Annual Commission</p>
                      <p className="font-medium text-green-600">
                        R{(selectedPolicy.monthlyCommission * 12).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Active Policies</p>
                <p className="text-3xl font-bold mt-1">{stats.active}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.lapsed} lapsed, {stats.cancelled} cancelled
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Premium Volume</p>
                <p className="text-3xl font-bold mt-1">R{stats.totalPremium.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Annual: R{(stats.totalPremium * 12).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Commission</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  R{stats.totalCommission.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Annual: R{stats.annualCommission.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900">Policy Statuses</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                  <li>
                    <strong>Active:</strong> Policy is current and premiums are up to date
                  </li>
                  <li>
                    <strong>Lapsed:</strong> Policy has lapsed due to non-payment
                  </li>
                  <li>
                    <strong>Cancelled:</strong> Policy was cancelled by member or insurer
                  </li>
                  <li>
                    <strong>Pending:</strong> Policy application is being processed
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900">Commission Structure</p>
                <p className="mt-1">
                  Brokers earn 15% commission on all active policies. Commission is calculated
                  monthly based on the premium collected. Lapsed or cancelled policies do not earn
                  commission.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Renewal Management</p>
                <p className="mt-1">
                  Contact members 60 days before renewal to confirm coverage and update any
                  changes. Early renewal discussions help maintain high retention rates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
