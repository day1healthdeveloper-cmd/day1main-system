'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

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

  const payments = [
    {
      id: 'PAY-20260101-001',
      date: '1 Jan 2026',
      amount: 2900,
      status: 'completed',
      method: 'Debit Order',
      reference: 'INV-2026-001',
    },
    {
      id: 'PAY-20251201-002',
      date: '1 Dec 2025',
      amount: 2900,
      status: 'completed',
      method: 'Debit Order',
      reference: 'INV-2025-012',
    },
    {
      id: 'PAY-20251101-003',
      date: '1 Nov 2025',
      amount: 2900,
      status: 'completed',
      method: 'Debit Order',
      reference: 'INV-2025-011',
    },
  ];

  const invoices = [
    {
      id: 'INV-2026-002',
      date: '1 Feb 2026',
      dueDate: '5 Feb 2026',
      amount: 2900,
      status: 'pending',
    },
    {
      id: 'INV-2026-001',
      date: '1 Jan 2026',
      dueDate: '5 Jan 2026',
      amount: 2900,
      status: 'paid',
      paidDate: '1 Jan 2026',
    },
  ];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">
            Manage your payments and view payment history
          </p>
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Next Payment</CardDescription>
              <CardTitle className="text-3xl">R2,900</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Due on 5 Feb 2026</p>
              <Button className="w-full mt-4">Pay Now</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Payment Method</CardDescription>
              <CardTitle className="text-lg">Debit Order</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">FNB •••• 1234</p>
              <Button variant="outline" className="w-full mt-4">
                Update Method
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Paid (2025)</CardDescription>
              <CardTitle className="text-3xl">R34,800</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">12 payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Outstanding Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Invoices</CardTitle>
            <CardDescription>Invoices awaiting payment</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.filter(inv => inv.status === 'pending').length > 0 ? (
              <div className="space-y-3">
                {invoices
                  .filter(inv => inv.status === 'pending')
                  .map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium">{invoice.id}</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="text-xs text-gray-500">Invoice Date</p>
                            <p>{invoice.date}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Due Date</p>
                            <p className="font-medium text-yellow-700">{invoice.dueDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="font-medium">R{invoice.amount.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">Pay Now</Button>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No outstanding invoices
              </p>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Your recent payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">{payment.reference}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{payment.date}</span>
                        <span>•</span>
                        <span>{payment.method}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R{payment.amount.toFixed(2)}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Management */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">FNB Cheque Account</p>
                    <p className="text-sm text-gray-600">•••• •••• •••• 1234</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                + Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
