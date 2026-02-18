'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function FinanceLedgerPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const accounts = [
    { code: '1000', name: 'Cash', type: 'Asset', balance: 'R 1,250,000' },
    { code: '1100', name: 'Accounts Receivable', type: 'Asset', balance: 'R 850,000' },
    { code: '2000', name: 'Accounts Payable', type: 'Liability', balance: 'R 450,000' },
    { code: '3000', name: 'Premium Revenue', type: 'Revenue', balance: 'R 5,000,000' },
    { code: '4000', name: 'Claims Expense', type: 'Expense', balance: 'R 3,200,000' },
  ];

  const stats = {
    totalAssets: 'R 12,500,000',
    totalLiabilities: 'R 3,200,000',
    totalEquity: 'R 9,300,000',
  };

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.code.includes(searchTerm)
  );

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ledger</h1>
          <p className="text-gray-600 mt-1">View general ledger accounts</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.totalAssets}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Liabilities</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{stats.totalLiabilities}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Equity</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{stats.totalEquity}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Account code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ledger Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Code</th>
                    <th className="text-left py-3 px-4 font-medium">Account Name</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-right py-3 px-4 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr key={account.code} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono font-medium">{account.code}</td>
                      <td className="py-3 px-4">{account.name}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {account.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium">{account.balance}</td>
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
