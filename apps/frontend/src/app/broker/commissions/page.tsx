'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CommissionStatement {
  id: string;
  statementNumber: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  activePolicies: number;
  totalPremium: number;
  commissionRate: number;
  grossCommission: number;
  deductions: number;
  netCommission: number;
  status: 'pending' | 'approved' | 'paid';
  paymentDate?: string;
  paymentReference?: string;
}

interface CommissionDetail {
  policyNumber: string;
  memberName: string;
  product: string;
  premium: number;
  commissionRate: number;
  commission: number;
}

export default function BrokerCommissionsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStatement, setSelectedStatement] = useState<CommissionStatement | null>(null);
  const [showStatementDetails, setShowStatementDetails] = useState(false);

  // Mock commission statements data
  const [statements] = useState<CommissionStatement[]>([
    {
      id: '1',
      statementNumber: 'COMM-202401',
      period: 'January 2024',
      periodStart: '2024-01-01',
      periodEnd: '2024-01-31',
      activePolicies: 5,
      totalPremium: 11600.0,
      commissionRate: 15,
      grossCommission: 1740.0,
      deductions: 0,
      netCommission: 1740.0,
      status: 'pending',
    },
    {
      id: '2',
      statementNumber: 'COMM-202312',
      period: 'December 2023',
      periodStart: '2023-12-01',
      periodEnd: '2023-12-31',
      activePolicies: 4,
      totalPremium: 8700.0,
      commissionRate: 15,
      grossCommission: 1305.0,
      deductions: 0,
      netCommission: 1305.0,
      status: 'paid',
      paymentDate: '2024-01-10',
      paymentReference: 'EFT-2024-001234',
    },
    {
      id: '3',
      statementNumber: 'COMM-202311',
      period: 'November 2023',
      periodStart: '2023-11-01',
      periodEnd: '2023-11-30',
      activePolicies: 3,
      totalPremium: 5900.0,
      commissionRate: 15,
      grossCommission: 885.0,
      deductions: 0,
      netCommission: 885.0,
      status: 'paid',
      paymentDate: '2023-12-10',
      paymentReference: 'EFT-2023-009876',
    },
    {
      id: '4',
      statementNumber: 'COMM-202310',
      period: 'October 2023',
      periodStart: '2023-10-01',
      periodEnd: '2023-10-31',
      activePolicies: 3,
      totalPremium: 5900.0,
      commissionRate: 15,
      grossCommission: 885.0,
      deductions: 0,
      netCommission: 885.0,
      status: 'paid',
      paymentDate: '2023-11-10',
      paymentReference: 'EFT-2023-008765',
    },
  ]);

  // Mock commission details for selected statement
  const [commissionDetails] = useState<CommissionDetail[]>([
    {
      policyNumber: 'POL-20240108-001',
      memberName: 'Charlie Brown',
      product: 'Basic Plan',
      premium: 1500.0,
      commissionRate: 15,
      commission: 225.0,
    },
    {
      policyNumber: 'POL-20240105-045',
      memberName: 'Jane Doe',
      product: 'Family Plan',
      premium: 3200.0,
      commissionRate: 15,
      commission: 480.0,
    },
    {
      policyNumber: 'POL-20231215-123',
      memberName: 'Bob Johnson',
      product: 'Standard Plan',
      premium: 1800.0,
      commissionRate: 15,
      commission: 270.0,
    },
    {
      policyNumber: 'POL-20231110-067',
      memberName: 'David Smith',
      product: 'Premium Plan',
      premium: 2500.0,
      commissionRate: 15,
      commission: 375.0,
    },
    {
      policyNumber: 'POL-20231020-045',
      memberName: 'Emma Wilson',
      product: 'Standard Plan',
      premium: 1600.0,
      commissionRate: 15,
      commission: 240.0,
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

  const getStatusBadge = (status: CommissionStatement['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredStatements = statements.filter((statement) => {
    const matchesSearch =
      statement.statementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      statement.period.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || statement.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalStatements: statements.length,
    pending: statements.filter((s) => s.status === 'pending').length,
    paid: statements.filter((s) => s.status === 'paid').length,
    totalEarned: statements
      .filter((s) => s.status === 'paid')
      .reduce((sum, s) => sum + s.netCommission, 0),
    pendingAmount: statements
      .filter((s) => s.status === 'pending' || s.status === 'approved')
      .reduce((sum, s) => sum + s.netCommission, 0),
    ytdCommission: statements.reduce((sum, s) => sum + s.netCommission, 0),
    averageMonthly:
      statements.length > 0
        ? statements.reduce((sum, s) => sum + s.netCommission, 0) / statements.length
        : 0,
  };

  const handleViewStatement = (statement: CommissionStatement) => {
    setSelectedStatement(statement);
    setShowStatementDetails(true);
  };

  const handleDownloadStatement = (statement: CommissionStatement) => {
    alert(`Downloading statement ${statement.statementNumber}`);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commission Statements</h1>
          <p className="text-gray-600 mt-1">View your commission history and statements</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Statements</p>
                <p className="text-2xl font-bold mt-1">{stats.totalStatements}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Paid</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.paid}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Total Earned</p>
                <p className="text-xl font-bold mt-1">R{stats.totalEarned.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-xl font-bold mt-1 text-yellow-600">
                  R{stats.pendingAmount.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Avg/Month</p>
                <p className="text-xl font-bold mt-1">
                  R{stats.averageMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Statements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Search
                </label>
                <Input
                  id="search"
                  placeholder="Statement number, period..."
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
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statements Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Commission Statements</CardTitle>
                <CardDescription>
                  Showing {filteredStatements.length} of {statements.length} statements
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
                      Statement Number
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Period</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Policies</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Premium</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">
                      Gross Comm.
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Net Comm.</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStatements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No statements found matching your filters
                      </td>
                    </tr>
                  ) : (
                    filteredStatements.map((statement) => (
                      <tr key={statement.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-mono text-sm">{statement.statementNumber}</p>
                          {statement.paymentDate && (
                            <p className="text-xs text-gray-500">
                              Paid: {new Date(statement.paymentDate).toLocaleDateString()}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">{statement.period}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(statement.periodStart).toLocaleDateString()} -{' '}
                            {new Date(statement.periodEnd).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          {statement.activePolicies}
                        </td>
                        <td className="py-3 px-4 text-right">
                          R{statement.totalPremium.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          R{statement.grossCommission.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">
                          R{statement.netCommission.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(statement.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewStatement(statement)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadStatement(statement)}
                            >
                              Download
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Statement Details Modal */}
        {showStatementDetails && selectedStatement && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Commission Statement Details</CardTitle>
                  <CardDescription>{selectedStatement.statementNumber}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStatementDetails(false)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Statement Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Period</p>
                    <p className="font-medium">{selectedStatement.period}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Active Policies</p>
                    <p className="font-medium">{selectedStatement.activePolicies}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Premium</p>
                    <p className="font-medium">R{selectedStatement.totalPremium.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Net Commission</p>
                    <p className="font-medium text-green-600">
                      R{selectedStatement.netCommission.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Commission Details */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium">Policy Number</th>
                      <th className="text-left py-2 px-2 font-medium">Member</th>
                      <th className="text-left py-2 px-2 font-medium">Product</th>
                      <th className="text-right py-2 px-2 font-medium">Premium</th>
                      <th className="text-center py-2 px-2 font-medium">Rate</th>
                      <th className="text-right py-2 px-2 font-medium">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissionDetails.map((detail) => (
                      <tr key={detail.policyNumber} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-mono text-xs">{detail.policyNumber}</td>
                        <td className="py-2 px-2">{detail.memberName}</td>
                        <td className="py-2 px-2">{detail.product}</td>
                        <td className="py-2 px-2 text-right">R{detail.premium.toFixed(2)}</td>
                        <td className="py-2 px-2 text-center">{detail.commissionRate}%</td>
                        <td className="py-2 px-2 text-right font-medium text-green-600">
                          R{detail.commission.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-medium">
                      <td colSpan={3} className="py-2 px-2 text-right">
                        Totals:
                      </td>
                      <td className="py-2 px-2 text-right">
                        R
                        {commissionDetails
                          .reduce((sum, detail) => sum + detail.premium, 0)
                          .toFixed(2)}
                      </td>
                      <td className="py-2 px-2"></td>
                      <td className="py-2 px-2 text-right font-medium text-green-600">
                        R
                        {commissionDetails
                          .reduce((sum, detail) => sum + detail.commission, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment Information */}
              {selectedStatement.paymentDate && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Payment Information</p>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                    <div>
                      <p className="text-green-700">Payment Date</p>
                      <p className="font-medium text-green-900">
                        {new Date(selectedStatement.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-700">Reference</p>
                      <p className="font-medium text-green-900 font-mono">
                        {selectedStatement.paymentReference}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900">Commission Structure</p>
                <p className="mt-1">
                  Brokers earn 15% commission on all active policies. Commission is calculated
                  monthly based on premiums collected during the statement period.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Payment Schedule</p>
                <p className="mt-1">
                  Commission statements are generated on the 1st of each month for the previous
                  month. Payments are processed within 10 business days of statement generation.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Statement Details</p>
                <p className="mt-1">
                  Each statement shows all active policies during the period, premiums collected,
                  commission rates, and any deductions. Click "View" to see the detailed breakdown.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Queries</p>
                <p className="mt-1">
                  If you have questions about a commission statement, please contact broker support
                  at broker-support@day1main.co.za or call 0860 123 456.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
