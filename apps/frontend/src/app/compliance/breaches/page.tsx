'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BreachesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const breaches = [
    { id: 'BR-001', date: '2026-01-11', type: 'Unauthorized Access', severity: 'high', affected: 150, status: 'investigating', reported: 'Yes' },
    { id: 'BR-002', date: '2026-01-05', type: 'Data Leak', severity: 'critical', affected: 500, status: 'contained', reported: 'Yes' },
    { id: 'BR-003', date: '2025-12-28', type: 'Lost Device', severity: 'medium', affected: 25, status: 'resolved', reported: 'Yes' },
    { id: 'BR-004', date: '2025-12-20', type: 'Email Misdirection', severity: 'low', affected: 1, status: 'resolved', reported: 'No' },
    { id: 'BR-005', date: '2025-12-15', type: 'System Breach', severity: 'high', affected: 300, status: 'resolved', reported: 'Yes' },
  ];

  const stats = {
    totalBreaches: 23,
    critical: 2,
    investigating: 3,
    resolved: 18,
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'contained': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBreaches = breaches.filter(breach => {
    const matchesSearch = breach.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         breach.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = severityFilter === 'all' || breach.severity === severityFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Breach Incidents</h1>
          <p className="text-gray-600 mt-1">Track and manage data breach incidents</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Breaches</p>
                <p className="text-3xl font-bold mt-1">{stats.totalBreaches}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.critical}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Investigating</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.investigating}</p>
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
                  placeholder="Breach ID, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Severity</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>All Statuses</option>
                  <option>Investigating</option>
                  <option>Contained</option>
                  <option>Resolved</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breaches Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Breach Incidents</CardTitle>
              <Button size="sm" variant="destructive">Report Breach</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Breach ID</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Severity</th>
                    <th className="text-left py-3 px-4 font-medium">Affected Records</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Reported to Regulator</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBreaches.map((breach) => (
                    <tr key={breach.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{breach.id}</td>
                      <td className="py-3 px-4 text-sm">{breach.date}</td>
                      <td className="py-3 px-4">{breach.type}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(breach.severity)}`}>
                          {breach.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium">{breach.affected}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(breach.status)}`}>
                          {breach.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-1 rounded ${breach.reported === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {breach.reported}
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
