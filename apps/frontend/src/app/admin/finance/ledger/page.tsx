'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LedgerPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const accounts = [
    { code: '1000', name: 'Cash', type: 'Asset', balance: 'R 1,250,000', debit: 'R 2,500,000', credit: 'R 1,250,000' },
    { code: '1100', name: 'Accounts Receivable', type: 'Asset', balance: 'R 850,000', debit: 'R 1,200,000', credit: 'R 350,000' },
    { code: '2000', name: 'Accounts Payable', type: 'Liability', balance: 'R 450,000', debit: 'R 200,000', credit: 'R 650,000' },
    { code: '3000', name: 'Premium Revenue', type: 'Revenue', balance: 'R 5,000,000', debit: 'R 0', credit: 'R 5,000,000' },
    { code: '4000', name: 'Claims Expense', type: 'Expense', balance: 'R 3,200,000', debit: 'R 3,200,000', credit: 'R 0' },
  ];

  const stats = {
    totalAssets: 'R 12,500,000',
    totalLiabilities: 'R 3,200,000',
    totalEquity: 'R 9,300,000',
    netIncome: 'R 1,800,000',
  };

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.code.includes(searchTerm)
  );

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">General Ledger</h1>
          <p className="text-gray-600 mt-1">Chart of accounts and ledger balances</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Net Income</p>
                <p className="text-2xl font-bold mt-1 text-purple-600">{stats.netIncome}</p>
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
            <div className="flex items-center justify-between">
              <CardTitle>Chart of Accounts</CardTitle>
              <Button size="sm">New Account</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Code</th>
                    <th className="text-left py-3 px-4 font-medium">Account Name</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-right py-3 px-4 font-medium">Debit</th>
                    <th className="text-right py-3 px-4 font-medium">Credit</th>
                    <th className="text-right py-3 px-4 font-medium">Balance</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
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
                      <td className="py-3 px-4 text-right font-mono">{account.debit}</td>
                      <td className="py-3 px-4 text-right font-mono">{account.credit}</td>
                      <td className="py-3 px-4 text-right font-mono font-medium">{account.balance}</td>
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
