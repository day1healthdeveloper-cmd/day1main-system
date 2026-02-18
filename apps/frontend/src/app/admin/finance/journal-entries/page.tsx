'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function JournalEntriesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const entries = [
    { id: 'JE-001', date: '2026-01-12', description: 'Premium collection', debit: '1000 - Cash', credit: '3000 - Premium Revenue', amount: 'R 50,000', status: 'posted' },
    { id: 'JE-002', date: '2026-01-11', description: 'Claim payment', debit: '4000 - Claims Expense', credit: '1000 - Cash', amount: 'R 15,000', status: 'posted' },
    { id: 'JE-003', date: '2026-01-10', description: 'Commission payment', debit: '4100 - Commission Expense', credit: '2000 - Accounts Payable', amount: 'R 8,000', status: 'draft' },
    { id: 'JE-004', date: '2026-01-09', description: 'Reinsurance premium', debit: '4200 - Reinsurance Expense', credit: '1000 - Cash', amount: 'R 25,000', status: 'posted' },
    { id: 'JE-005', date: '2026-01-08', description: 'Investment income', debit: '1000 - Cash', credit: '3100 - Investment Income', amount: 'R 12,000', status: 'posted' },
  ];

  const stats = {
    totalEntries: 1247,
    draftEntries: 23,
    postedToday: 15,
    totalAmount: 'R 8,500,000',
  };

  const filteredEntries = entries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journal Entries</h1>
          <p className="text-gray-600 mt-1">Double-entry bookkeeping journal entries</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-3xl font-bold mt-1">{stats.totalEntries}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Draft Entries</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.draftEntries}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Posted Today</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.postedToday}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{stats.totalAmount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Entry ID or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Entries Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Journal Entries</CardTitle>
              <Button size="sm">New Entry</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Entry ID</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-left py-3 px-4 font-medium">Debit Account</th>
                    <th className="text-left py-3 px-4 font-medium">Credit Account</th>
                    <th className="text-right py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{entry.id}</td>
                      <td className="py-3 px-4 text-sm">{entry.date}</td>
                      <td className="py-3 px-4">{entry.description}</td>
                      <td className="py-3 px-4 text-sm">{entry.debit}</td>
                      <td className="py-3 px-4 text-sm">{entry.credit}</td>
                      <td className="py-3 px-4 text-right font-mono">{entry.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${entry.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {entry.status}
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
