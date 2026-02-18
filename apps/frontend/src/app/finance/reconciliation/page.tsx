'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FinanceReconciliationPage() {
  const reconciliations = [
    { id: 'REC-001', account: 'Standard Bank - Current', period: 'Jan 2026', difference: 'R 1,500', status: 'pending' },
    { id: 'REC-002', account: 'FNB - Savings', period: 'Jan 2026', difference: 'R 0', status: 'reconciled' },
    { id: 'REC-003', account: 'Nedbank - Investment', period: 'Dec 2025', difference: 'R 0', status: 'reconciled' },
  ];

  const stats = {
    totalAccounts: 12,
    reconciled: 8,
    pending: 3,
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reconciliation</h1>
          <p className="text-gray-600 mt-1">Bank reconciliation status</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Accounts</p>
                <p className="text-3xl font-bold mt-1">{stats.totalAccounts}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Reconciled</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.reconciled}</p>
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
        </div>

        {/* Reconciliations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Reconciliations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">ID</th>
                    <th className="text-left py-3 px-4 font-medium">Account</th>
                    <th className="text-left py-3 px-4 font-medium">Period</th>
                    <th className="text-right py-3 px-4 font-medium">Difference</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliations.map((rec) => (
                    <tr key={rec.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{rec.id}</td>
                      <td className="py-3 px-4">{rec.account}</td>
                      <td className="py-3 px-4">{rec.period}</td>
                      <td className="py-3 px-4 text-right font-mono">{rec.difference}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${rec.status === 'reconciled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
