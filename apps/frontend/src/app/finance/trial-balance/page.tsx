'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FinanceTrialBalancePage() {
  const accounts = [
    { code: '1000', name: 'Cash', debit: 'R 1,250,000', credit: '' },
    { code: '1100', name: 'Accounts Receivable', debit: 'R 850,000', credit: '' },
    { code: '2000', name: 'Accounts Payable', debit: '', credit: 'R 450,000' },
    { code: '3000', name: 'Premium Revenue', debit: '', credit: 'R 5,000,000' },
    { code: '4000', name: 'Claims Expense', debit: 'R 3,200,000', credit: '' },
  ];

  const totals = {
    totalDebit: 'R 8,550,000',
    totalCredit: 'R 6,950,000',
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trial Balance</h1>
          <p className="text-gray-600 mt-1">View trial balance report</p>
        </div>

        {/* Trial Balance Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Trial Balance - January 2026</CardTitle>
              <Button variant="outline" size="sm">Export PDF</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-medium">Code</th>
                    <th className="text-left py-3 px-4 font-medium">Account Name</th>
                    <th className="text-right py-3 px-4 font-medium">Debit</th>
                    <th className="text-right py-3 px-4 font-medium">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.code} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono">{account.code}</td>
                      <td className="py-3 px-4">{account.name}</td>
                      <td className="py-3 px-4 text-right font-mono">{account.debit}</td>
                      <td className="py-3 px-4 text-right font-mono">{account.credit}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300 font-bold bg-gray-50">
                    <td className="py-3 px-4" colSpan={2}>TOTALS</td>
                    <td className="py-3 px-4 text-right font-mono text-lg">{totals.totalDebit}</td>
                    <td className="py-3 px-4 text-right font-mono text-lg">{totals.totalCredit}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
