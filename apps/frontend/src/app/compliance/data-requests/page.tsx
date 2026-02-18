'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DataRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const requests = [
    { id: 'DSR-001', date: '2026-01-10', requester: 'John Smith', email: 'john@example.com', type: 'Access', status: 'pending', dueDate: '2026-01-25' },
    { id: 'DSR-002', date: '2026-01-09', requester: 'Sarah Johnson', email: 'sarah@example.com', type: 'Rectification', status: 'in_progress', dueDate: '2026-01-24' },
    { id: 'DSR-003', date: '2026-01-08', requester: 'Mike Brown', email: 'mike@example.com', type: 'Erasure', status: 'completed', dueDate: '2026-01-23' },
    { id: 'DSR-004', date: '2026-01-07', requester: 'Lisa Davis', email: 'lisa@example.com', type: 'Portability', status: 'pending', dueDate: '2026-01-22' },
    { id: 'DSR-005', date: '2026-01-06', requester: 'Tom Wilson', email: 'tom@example.com', type: 'Objection', status: 'completed', dueDate: '2026-01-21' },
  ];

  const stats = {
    totalRequests: 47,
    pending: 12,
    inProgress: 8,
    completed: 27,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.requester.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Subject Requests</h1>
          <p className="text-gray-600 mt-1">POPIA data subject access requests (DSARs)</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold mt-1">{stats.totalRequests}</p>
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
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.inProgress}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.completed}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Name, email, request ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Request Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>All Types</option>
                  <option>Access</option>
                  <option>Rectification</option>
                  <option>Erasure</option>
                  <option>Portability</option>
                  <option>Objection</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Data Subject Requests</CardTitle>
              <Button size="sm">New Request</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Request ID</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Requester</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{req.id}</td>
                      <td className="py-3 px-4 text-sm">{req.date}</td>
                      <td className="py-3 px-4">{req.requester}</td>
                      <td className="py-3 px-4 text-sm">{req.email}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          {req.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(req.status)}`}>
                          {req.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{req.dueDate}</td>
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
