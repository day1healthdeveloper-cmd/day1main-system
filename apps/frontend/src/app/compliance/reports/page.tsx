'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ComplianceReportsPage() {
  const reports = [
    { id: 'REP-001', name: 'POPIA Annual Report', type: 'Annual', period: '2025', status: 'completed', date: '2026-01-15' },
    { id: 'REP-002', name: 'Data Processing Activities', type: 'Quarterly', period: 'Q4 2025', status: 'in_progress', date: '2026-01-10' },
    { id: 'REP-003', name: 'Breach Notification Report', type: 'Ad-hoc', period: 'Jan 2026', status: 'pending', date: '2026-01-12' },
    { id: 'REP-004', name: 'Consent Management Report', type: 'Monthly', period: 'Dec 2025', status: 'completed', date: '2026-01-05' },
    { id: 'REP-005', name: 'Data Subject Requests Report', type: 'Monthly', period: 'Dec 2025', status: 'completed', date: '2026-01-05' },
  ];

  const stats = {
    totalReports: 156,
    pending: 8,
    inProgress: 12,
    completed: 136,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Regulatory Reports</h1>
          <p className="text-gray-600 mt-1">Compliance and regulatory reporting</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-3xl font-bold mt-1">{stats.totalReports}</p>
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

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Reports</CardTitle>
              <Button size="sm">Generate Report</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Report ID</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Period</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{report.id}</td>
                      <td className="py-3 px-4">{report.name}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          {report.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">{report.period}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(report.status)}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{report.date}</td>
                      <td className="py-3 px-4 space-x-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Download</Button>
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
