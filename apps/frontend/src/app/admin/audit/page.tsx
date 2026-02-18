'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminAuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('all');

  const auditLogs = [
    { id: '1', timestamp: '2026-01-12 14:30:15', user: 'admin@day1main.com', event: 'user_login', entity: 'User', action: 'login', ip: '192.168.1.100', details: 'Successful login' },
    { id: '2', timestamp: '2026-01-12 14:25:42', user: 'member@day1main.com', event: 'policy_viewed', entity: 'Policy', action: 'read', ip: '192.168.1.101', details: 'Viewed policy POL-20240108-001' },
    { id: '3', timestamp: '2026-01-12 14:20:18', user: 'assessor@day1main.com', event: 'claim_approved', entity: 'Claim', action: 'update', ip: '192.168.1.102', details: 'Approved claim CLM-20240111-001 for R3,500' },
    { id: '4', timestamp: '2026-01-12 14:15:33', user: 'broker@day1main.com', event: 'lead_created', entity: 'Lead', action: 'create', ip: '192.168.1.103', details: 'Created lead for John Smith' },
    { id: '5', timestamp: '2026-01-12 14:10:55', user: 'finance@day1main.com', event: 'payment_processed', entity: 'Payment', action: 'create', ip: '192.168.1.104', details: 'Processed payment PAY-20240112-001 for R2,500' },
  ];

  const stats = {
    totalEvents: 15847,
    todayEvents: 234,
    failedLogins: 12,
    criticalEvents: 3,
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = eventFilter === 'all' || log.event.includes(eventFilter);
    return matchesSearch && matchesFilter;
  });

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-600 mt-1">System-wide audit trail and activity monitoring</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-3xl font-bold mt-1">{stats.totalEvents.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Today's Events</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.todayEvents}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Failed Logins</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.failedLogins}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Critical Events</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.criticalEvents}</p>
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
                  placeholder="User, event, details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Type</label>
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Events</option>
                  <option value="login">Login Events</option>
                  <option value="claim">Claim Events</option>
                  <option value="payment">Payment Events</option>
                  <option value="policy">Policy Events</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Today</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Custom range</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Audit Events</CardTitle>
              <Button variant="outline" size="sm">Export CSV</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Timestamp</th>
                    <th className="text-left py-3 px-4 font-medium">User</th>
                    <th className="text-left py-3 px-4 font-medium">Event</th>
                    <th className="text-left py-3 px-4 font-medium">Entity</th>
                    <th className="text-left py-3 px-4 font-medium">Action</th>
                    <th className="text-left py-3 px-4 font-medium">IP Address</th>
                    <th className="text-left py-3 px-4 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-mono">{log.timestamp}</td>
                      <td className="py-3 px-4 text-sm">{log.user}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {log.event}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{log.entity}</td>
                      <td className="py-3 px-4 text-sm">{log.action}</td>
                      <td className="py-3 px-4 text-sm font-mono">{log.ip}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{log.details}</td>
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
