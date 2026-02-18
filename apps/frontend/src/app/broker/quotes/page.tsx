'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BrokerQuotesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const quotes = [
    { id: 'QUO-001', client: 'John Smith', product: 'Comprehensive Plan', premium: 'R 2,500', status: 'pending', date: '2026-01-10' },
    { id: 'QUO-002', client: 'Sarah Johnson', product: 'Hospital Plan', premium: 'R 1,800', status: 'accepted', date: '2026-01-09' },
    { id: 'QUO-003', client: 'Mike Brown', product: 'Basic Plan', premium: 'R 1,200', status: 'expired', date: '2025-12-28' },
    { id: 'QUO-004', client: 'Lisa Davis', product: 'Comprehensive Plan', premium: 'R 2,800', status: 'pending', date: '2026-01-08' },
    { id: 'QUO-005', client: 'Tom Wilson', product: 'Hospital Plan', premium: 'R 1,900', status: 'declined', date: '2026-01-07' },
  ];

  const stats = {
    totalQuotes: 47,
    pending: 12,
    accepted: 28,
    totalValue: 'R 125,000',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredQuotes = quotes.filter(quote =>
    quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600 mt-1">Manage client quotes</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Quotes</p>
                <p className="text-3xl font-bold mt-1">{stats.totalQuotes}</p>
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
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.accepted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{stats.totalValue}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Quote ID or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Quotes Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quotes</CardTitle>
              <Button size="sm">New Quote</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Quote ID</th>
                    <th className="text-left py-3 px-4 font-medium">Client</th>
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-right py-3 px-4 font-medium">Premium</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{quote.id}</td>
                      <td className="py-3 px-4">{quote.client}</td>
                      <td className="py-3 px-4 text-sm">{quote.product}</td>
                      <td className="py-3 px-4 text-right font-mono">{quote.premium}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(quote.status)}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{quote.date}</td>
                      <td className="py-3 px-4 space-x-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Convert</Button>
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
