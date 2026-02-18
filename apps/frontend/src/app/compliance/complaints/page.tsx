'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const complaints = [
    { id: 'CMP-001', date: '2026-01-10', complainant: 'John Smith', category: 'Privacy', priority: 'high', status: 'open', assignedTo: 'Sarah Jones' },
    { id: 'CMP-002', date: '2026-01-08', complainant: 'Mary Johnson', category: 'Data Access', priority: 'medium', status: 'in_progress', assignedTo: 'Mike Brown' },
    { id: 'CMP-003', date: '2026-01-05', complainant: 'Tom Wilson', category: 'Marketing', priority: 'low', status: 'resolved', assignedTo: 'Lisa Davis' },
    { id: 'CMP-004', date: '2026-01-03', complainant: 'Sarah Davis', category: 'Data Breach', priority: 'critical', status: 'escalated', assignedTo: 'John Miller' },
    { id: 'CMP-005', date: '2025-12-28', complainant: 'Mike Brown', category: 'Consent', priority: 'medium', status: 'resolved', assignedTo: 'Sarah Jones' },
  ];

  const stats = {
    totalComplaints: 89,
    open: 15,
    inProgress: 22,
    resolved: 52,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.complainant.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || complaint.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Complaints Management</h1>
          <p className="text-gray-600 mt-1">Track and resolve compliance-related complaints</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Complaints</p>
                <p className="text-3xl font-bold mt-1">{stats.totalComplaints}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.open}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.inProgress}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.resolved}</p>
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
                  placeholder="Complaint ID, name, category..."
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
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>All Categories</option>
                  <option>Privacy</option>
                  <option>Data Access</option>
                  <option>Marketing</option>
                  <option>Data Breach</option>
                  <option>Consent</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Complaints</CardTitle>
              <Button size="sm">New Complaint</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Complaint ID</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Complainant</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Priority</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Assigned To</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{complaint.id}</td>
                      <td className="py-3 px-4 text-sm">{complaint.date}</td>
                      <td className="py-3 px-4">{complaint.complainant}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          {complaint.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(complaint.status)}`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{complaint.assignedTo}</td>
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
