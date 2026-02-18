'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PreAuthPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const preauths = [
    { id: 'PA-001', member: 'John Smith', provider: 'Netcare Hospital', procedure: 'Hip Replacement', amount: 'R 85,000', status: 'pending', date: '2026-01-10' },
    { id: 'PA-002', member: 'Sarah Johnson', provider: 'Life Healthcare', procedure: 'Knee Surgery', amount: 'R 65,000', status: 'approved', date: '2026-01-09' },
    { id: 'PA-003', member: 'Mike Brown', provider: 'Mediclinic', procedure: 'Cardiac Catheterization', amount: 'R 45,000', status: 'pending', date: '2026-01-08' },
    { id: 'PA-004', member: 'Lisa Davis', provider: 'Netcare Hospital', procedure: 'Spinal Surgery', amount: 'R 120,000', status: 'review', date: '2026-01-07' },
    { id: 'PA-005', member: 'Tom Wilson', provider: 'Life Healthcare', procedure: 'Cataract Surgery', amount: 'R 25,000', status: 'approved', date: '2026-01-06' },
  ];

  const stats = {
    totalPreAuths: 156,
    pending: 45,
    approved: 98,
    review: 13,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPreAuths = preauths.filter(pa =>
    pa.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pa.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pa.procedure.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pre-Authorization Queue</h1>
          <p className="text-gray-600 mt-1">Review and approve pre-authorization requests</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold mt-1">{stats.totalPreAuths}</p>
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
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.approved}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.review}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Pre-Authorizations</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Member name, ID, or procedure..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Pre-Auths Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pre-Authorization Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">PA ID</th>
                    <th className="text-left py-3 px-4 font-medium">Member</th>
                    <th className="text-left py-3 px-4 font-medium">Provider</th>
                    <th className="text-left py-3 px-4 font-medium">Procedure</th>
                    <th className="text-right py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPreAuths.map((pa) => (
                    <tr key={pa.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{pa.id}</td>
                      <td className="py-3 px-4">{pa.member}</td>
                      <td className="py-3 px-4 text-sm">{pa.provider}</td>
                      <td className="py-3 px-4">{pa.procedure}</td>
                      <td className="py-3 px-4 text-right font-mono">{pa.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(pa.status)}`}>
                          {pa.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{pa.date}</td>
                      <td className="py-3 px-4 space-x-2">
                        <Button variant="outline" size="sm">Review</Button>
                        <Button size="sm">Approve</Button>
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
