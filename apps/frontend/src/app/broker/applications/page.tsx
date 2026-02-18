'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BrokerApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const applications = [
    { id: 'APP-001', client: 'John Smith', product: 'Comprehensive Plan', status: 'pending', date: '2026-01-10', premium: 'R 2,500' },
    { id: 'APP-002', client: 'Sarah Johnson', product: 'Hospital Plan', status: 'approved', date: '2026-01-09', premium: 'R 1,800' },
    { id: 'APP-003', client: 'Mike Brown', product: 'Basic Plan', status: 'underwriting', date: '2026-01-08', premium: 'R 1,200' },
    { id: 'APP-004', client: 'Lisa Davis', product: 'Comprehensive Plan', status: 'pending', date: '2026-01-07', premium: 'R 2,800' },
    { id: 'APP-005', client: 'Tom Wilson', product: 'Hospital Plan', status: 'rejected', date: '2026-01-06', premium: 'R 1,900' },
  ];

  const stats = {
    totalApplications: 89,
    pending: 23,
    approved: 52,
    underwriting: 14,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'underwriting': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = applications.filter(app =>
    app.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-1">Track client applications</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold mt-1">{stats.totalApplications}</p>
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
                <p className="text-sm text-gray-600">Underwriting</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.underwriting}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Application ID or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Applications</CardTitle>
              <Button size="sm">New Application</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Application ID</th>
                    <th className="text-left py-3 px-4 font-medium">Client</th>
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-right py-3 px-4 font-medium">Premium</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{app.id}</td>
                      <td className="py-3 px-4">{app.client}</td>
                      <td className="py-3 px-4 text-sm">{app.product}</td>
                      <td className="py-3 px-4 text-right font-mono">{app.premium}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{app.date}</td>
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
