'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Payment {
  paymentNumber: string;
  paymentDate: string;
  periodStart: string;
  periodEnd: string;
  claimCount: number;
  totalClaimed: number;
  totalApproved: number;
  totalPaid: number;
  deductions: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  paymentMethod: 'eft' | 'cheque';
  referenceNumber: string;
}

interface RemittanceItem {
  claimNumber: string;
  patientName: string;
  serviceDate: string;
  claimedAmount: number;
  approvedAmount: number;
  paidAmount: number;
  deductions: number;
  reasonCodes: string[];
}

export default function ProviderPaymentsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showRemittance, setShowRemittance] = useState(false);

  // Mock payment data
  const [payments] = useState<Payment[]>([
    {
      paymentNumber: 'PAY-20240110-001',
      paymentDate: '2024-01-10',
      periodStart: '2024-01-01',
      periodEnd: '2024-01-07',
      claimCount: 15,
      totalClaimed: 45750.0,
      totalApproved: 43200.0,
      totalPaid: 43200.0,
      deductions: 0,
      status: 'paid',
      paymentMethod: 'eft',
      referenceNumber: 'EFT-2024-001234',
    },
    {
      paymentNumber: 'PAY-20240108-002',
      paymentDate: '2024-01-08',
      periodStart: '2023-12-25',
      periodEnd: '2023-12-31',
      claimCount: 12,
      totalClaimed: 38900.0,
      totalApproved: 36500.0,
      totalPaid: 36500.0,
      deductions: 0,
      status: 'paid',
      paymentMethod: 'eft',
      referenceNumber: 'EFT-2024-001189',
    },
    {
      paymentNumber: 'PAY-20240105-003',
      paymentDate: '2024-01-05',
      periodStart: '2023-12-18',
      periodEnd: '2023-12-24',
      claimCount: 18,
      totalClaimed: 52300.0,
      totalApproved: 48750.0,
      totalPaid: 48750.0,
      deductions: 0,
      status: 'paid',
      paymentMethod: 'eft',
      referenceNumber: 'EFT-2024-001098',
    },
    {
      paymentNumber: 'PAY-20240111-004',
      paymentDate: '2024-01-11',
      periodStart: '2024-01-08',
      periodEnd: '2024-01-10',
      claimCount: 8,
      totalClaimed: 28400.0,
      totalApproved: 26800.0,
      totalPaid: 0,
      deductions: 0,
      status: 'processing',
      paymentMethod: 'eft',
      referenceNumber: 'PENDING',
    },
  ]);

  // Mock remittance data for selected payment
  const [remittanceItems] = useState<RemittanceItem[]>([
    {
      claimNumber: 'CLM-20240110-001234',
      patientName: 'John Smith',
      serviceDate: '2024-01-08',
      claimedAmount: 850.0,
      approvedAmount: 850.0,
      paidAmount: 850.0,
      deductions: 0,
      reasonCodes: [],
    },
    {
      claimNumber: 'CLM-20240109-001189',
      patientName: 'Jane Doe',
      serviceDate: '2024-01-07',
      claimedAmount: 3500.0,
      approvedAmount: 3150.0,
      paidAmount: 3150.0,
      deductions: 350.0,
      reasonCodes: ['R01: Tariff limit applied'],
    },
    {
      claimNumber: 'CLM-20240108-001156',
      patientName: 'Bob Johnson',
      serviceDate: '2024-01-06',
      claimedAmount: 1200.0,
      approvedAmount: 1200.0,
      paidAmount: 1200.0,
      deductions: 0,
      reasonCodes: [],
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

  const getStatusBadge = (status: Payment['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    const matchesDateFrom = !dateFrom || payment.paymentDate >= dateFrom;
    const matchesDateTo = !dateTo || payment.paymentDate <= dateTo;

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const stats = {
    totalPayments: payments.length,
    totalPaid: payments.reduce((sum, p) => sum + p.totalPaid, 0),
    totalPending: payments
      .filter((p) => p.status === 'processing' || p.status === 'pending')
      .reduce((sum, p) => sum + p.totalApproved, 0),
    averagePayment:
      payments.filter((p) => p.totalPaid > 0).reduce((sum, p) => sum + p.totalPaid, 0) /
      payments.filter((p) => p.totalPaid > 0).length,
  };

  const handleViewRemittance = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowRemittance(true);
  };

  const handleDownloadRemittance = (payment: Payment) => {
    // Simulate download
    alert(`Downloading remittance advice for ${payment.paymentNumber}`);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments & Remittance</h1>
          <p className="text-gray-600 mt-1">View payment history and remittance advice</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-3xl font-bold mt-1">{stats.totalPayments}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Paid (YTD)</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  R{stats.totalPaid.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">
                  R{stats.totalPending.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Average Payment</p>
                <p className="text-2xl font-bold mt-1">
                  R{stats.averagePayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Search
                </label>
                <Input
                  id="search"
                  placeholder="Payment number, reference..."
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
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
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

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  Showing {filteredPayments.length} of {payments.length} payments
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
                      Payment Number
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Period</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Claims</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Claimed</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Approved</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Paid</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No payments found matching your filters
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr key={payment.paymentNumber} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-mono text-sm">{payment.paymentNumber}</p>
                          <p className="text-xs text-gray-500">
                            Paid: {new Date(payment.paymentDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">Ref: {payment.referenceNumber}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">
                            {new Date(payment.periodStart).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">to</p>
                          <p className="text-sm">
                            {new Date(payment.periodEnd).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          {payment.claimCount}
                        </td>
                        <td className="py-3 px-4 text-right">
                          R{payment.totalClaimed.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          R{payment.totalApproved.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">
                          {payment.totalPaid > 0 ? (
                            `R${payment.totalPaid.toFixed(2)}`
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(payment.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewRemittance(payment)}
                              disabled={payment.status !== 'paid'}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadRemittance(payment)}
                              disabled={payment.status !== 'paid'}
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

        {/* Remittance Advice Modal */}
        {showRemittance && selectedPayment && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Remittance Advice</CardTitle>
                  <CardDescription>{selectedPayment.paymentNumber}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowRemittance(false)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Payment Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Payment Date</p>
                    <p className="font-medium">
                      {new Date(selectedPayment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Reference</p>
                    <p className="font-medium font-mono text-sm">
                      {selectedPayment.referenceNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Claims Included</p>
                    <p className="font-medium">{selectedPayment.claimCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Paid</p>
                    <p className="font-medium text-green-600">
                      R{selectedPayment.totalPaid.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Remittance Items */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium">Claim Number</th>
                      <th className="text-left py-2 px-2 font-medium">Patient</th>
                      <th className="text-left py-2 px-2 font-medium">Service Date</th>
                      <th className="text-right py-2 px-2 font-medium">Claimed</th>
                      <th className="text-right py-2 px-2 font-medium">Approved</th>
                      <th className="text-right py-2 px-2 font-medium">Deductions</th>
                      <th className="text-right py-2 px-2 font-medium">Paid</th>
                      <th className="text-left py-2 px-2 font-medium">Reason Codes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remittanceItems.map((item) => (
                      <tr key={item.claimNumber} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-mono text-xs">{item.claimNumber}</td>
                        <td className="py-2 px-2">{item.patientName}</td>
                        <td className="py-2 px-2">
                          {new Date(item.serviceDate).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-2 text-right">R{item.claimedAmount.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right">
                          R{item.approvedAmount.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-right text-red-600">
                          {item.deductions > 0 ? `-R${item.deductions.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2 px-2 text-right font-medium text-green-600">
                          R{item.paidAmount.toFixed(2)}
                        </td>
                        <td className="py-2 px-2">
                          {item.reasonCodes.length > 0 ? (
                            <div className="text-xs">
                              {item.reasonCodes.map((code, idx) => (
                                <p key={idx} className="text-gray-600">
                                  {code}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
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
                        {remittanceItems
                          .reduce((sum, item) => sum + item.claimedAmount, 0)
                          .toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right">
                        R
                        {remittanceItems
                          .reduce((sum, item) => sum + item.approvedAmount, 0)
                          .toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right text-red-600">
                        -R
                        {remittanceItems
                          .reduce((sum, item) => sum + item.deductions, 0)
                          .toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right font-medium text-green-600">
                        R
                        {remittanceItems
                          .reduce((sum, item) => sum + item.paidAmount, 0)
                          .toFixed(2)}
                      </td>
                      <td className="py-2 px-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900">Payment Schedule</p>
                <p className="mt-1">
                  Payments are processed weekly for approved claims. Funds are typically
                  transferred within 2-3 business days after payment processing.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Remittance Advice</p>
                <p className="mt-1">
                  Each payment includes a detailed remittance advice showing all claims included,
                  approved amounts, deductions, and reason codes for any adjustments.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Common Reason Codes</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                  <li>R01: Tariff limit applied</li>
                  <li>R02: Co-payment deducted</li>
                  <li>R03: Annual limit reached</li>
                  <li>R04: Network penalty applied</li>
                  <li>R05: Duplicate claim</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900">Payment Queries</p>
                <p className="mt-1">
                  If you have questions about a payment or remittance advice, please contact our
                  provider support team at provider-support@day1main.co.za or call 0860 123 456.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
