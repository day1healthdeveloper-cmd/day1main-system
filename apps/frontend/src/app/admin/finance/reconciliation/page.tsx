'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReconciliationPage() {
  const reconciliations = [
    { id: 'REC-001', account: 'Standard Bank - Current', period: 'Jan 2026', bankBalance: 'R 1,250,000', bookBalance: 'R 1,248,500', difference: 'R 1,500', status: 'pending' },
    { id: 'REC-002', account: 'FNB - Savings', period: 'Jan 2026', bankBalance: 'R 500,000', bookBalance: 'R 500,000', difference: 'R 0', status: 'reconciled' },
    { id: 'REC-003', account: 'Nedbank - Investment', period: 'Dec 2025', bankBalance: 'R 2,000,000', bookBalance: 'R 2,000,000', difference: 'R 0', status: 'reconciled' },
    { id: 'REC-004', account: 'Capitec - Petty Cash', period: 'Jan 2026', bankBalance: 'R 50,000', bookBalance: 'R 49,800', difference: 'R 200', status: 'in_progress' },
  ];

  const stats = {
    totalAccounts: 12,
    reconciled: 8,
    pending: 3,
    differences: 'R 1,700',
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bank Reconciliation</h1>
          <p className="text-gray-600 mt-1">Reconcile bank statements with ledger balances</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Differences</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{stats.differences}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reconciliations Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bank Reconciliations</CardTitle>
              <Button size="sm">New Reconciliation</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Reconciliation ID</th>
                    <th className="text-left py-3 px-4 font-medium">Account</th>
                    <th className="text-left py-3 px-4 font-medium">Period</th>
                    <th className="text-right py-3 px-4 font-medium">Bank Balance</th>
                    <th className="text-right py-3 px-4 font-medium">Book Balance</th>
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
                      <td className="py-3 px-4 text-right font-mono">{rec.bankBalance}</td>
                      <td className="py-3 px-4 text-right font-mono">{rec.bookBalance}</td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-red-600">{rec.difference}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          rec.status === 'reconciled' ? 'bg-green-100 text-green-800' :
                          rec.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rec.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">Reconcile</Button>
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
