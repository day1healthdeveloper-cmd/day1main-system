'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TrialBalancePage() {
  const accounts = [
    { code: '1000', name: 'Cash', debit: 'R 1,250,000', credit: '' },
    { code: '1100', name: 'Accounts Receivable', debit: 'R 850,000', credit: '' },
    { code: '1200', name: 'Investments', debit: 'R 2,000,000', credit: '' },
    { code: '2000', name: 'Accounts Payable', debit: '', credit: 'R 450,000' },
    { code: '2100', name: 'Claims Payable', debit: '', credit: 'R 1,200,000' },
    { code: '3000', name: 'Premium Revenue', debit: '', credit: 'R 5,000,000' },
    { code: '3100', name: 'Investment Income', debit: '', credit: 'R 300,000' },
    { code: '4000', name: 'Claims Expense', debit: 'R 3,200,000', credit: '' },
    { code: '4100', name: 'Commission Expense', debit: 'R 450,000', credit: '' },
    { code: '4200', name: 'Operating Expenses', debit: 'R 800,000', credit: '' },
  ];

  const totals = {
    totalDebit: 'R 8,550,000',
    totalCredit: 'R 6,950,000',
    difference: 'R 1,600,000',
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trial Balance</h1>
          <p className="text-gray-600 mt-1">Verify double-entry bookkeeping accuracy</p>
        </div>

        {/* Period Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Report Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Period</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>January 2026</option>
                  <option>December 2025</option>
                  <option>November 2025</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>All Accounts</option>
                  <option>Assets</option>
                  <option>Liabilities</option>
                  <option>Revenue</option>
                  <option>Expenses</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full">Generate Report</Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    <th className="text-left py-3 px-4 font-medium">Account Code</th>
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
                  <tr className="font-bold bg-yellow-50">
                    <td className="py-3 px-4" colSpan={2}>DIFFERENCE</td>
                    <td className="py-3 px-4 text-right font-mono text-lg text-red-600" colSpan={2}>{totals.difference}</td>
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
