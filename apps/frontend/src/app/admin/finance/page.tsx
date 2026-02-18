'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminFinancePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  const [financialStats] = useState({
    monthlyPremium: 2456780.0,
    claimsPaid: 1234560.0,
    outstandingClaims: 456780.0,
    cashReserves: 15678900.0,
    pendingReconciliations: 12,
    unmatchedPayments: 5,
  });

  // Disabled auth check for demo
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) router.push('/login');
  // }, [loading, isAuthenticated, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Administration</h1>
          <p className="text-gray-600 mt-1">Manage invoicing, payments, and reconciliations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Monthly Premium</p><p className="text-2xl font-bold mt-1">R{financialStats.monthlyPremium.toLocaleString()}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Claims Paid</p><p className="text-2xl font-bold mt-1">R{financialStats.claimsPaid.toLocaleString()}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Outstanding</p><p className="text-2xl font-bold mt-1 text-yellow-600">R{financialStats.outstandingClaims.toLocaleString()}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Cash Reserves</p><p className="text-2xl font-bold mt-1 text-green-600">R{(financialStats.cashReserves / 1000000).toFixed(1)}M</p></div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/finance/invoicing')}>
            <CardHeader><CardTitle>Invoicing</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Generate and manage member invoices</p>
              <Button variant="outline" className="w-full">Manage Invoices</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/finance/payments')}>
            <CardHeader><CardTitle>Payment Processing</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Process payments and manage payment batches</p>
              <Button variant="outline" className="w-full">Process Payments</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/finance/reconciliations')}>
            <CardHeader><CardTitle>Reconciliations</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Match payments to bank statements</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Pending:</span>
                <span className="text-2xl font-bold text-yellow-600">{financialStats.pendingReconciliations}</span>
              </div>
              <Button variant="outline" className="w-full">View Reconciliations</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>General Ledger</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Premium Income</p>
                  <p className="text-sm text-gray-600">Account: 4000</p>
                </div>
                <p className="text-lg font-bold text-green-600">R{financialStats.monthlyPremium.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Claims Expense</p>
                  <p className="text-sm text-gray-600">Account: 5000</p>
                </div>
                <p className="text-lg font-bold text-red-600">R{financialStats.claimsPaid.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Cash at Bank</p>
                  <p className="text-sm text-gray-600">Account: 1000</p>
                </div>
                <p className="text-lg font-bold">R{financialStats.cashReserves.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">View Full Ledger</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
