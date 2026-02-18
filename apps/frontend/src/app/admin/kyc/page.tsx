'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminKYCPage() {
  const [statusFilter, setStatusFilter] = useState('pending');

  const kycRecords = [
    { id: '1', member: 'John Smith', idNumber: '8001015800083', status: 'pending', riskScore: 0, submittedDate: '2026-01-12', pepCheck: 'pending', cddLevel: 'standard' },
    { id: '2', member: 'Jane Doe', idNumber: '8505125800084', status: 'verified', riskScore: 15, submittedDate: '2026-01-10', pepCheck: 'clear', cddLevel: 'standard' },
    { id: '3', member: 'Bob Johnson', idNumber: '7803035800085', status: 'pending', riskScore: 0, submittedDate: '2026-01-11', pepCheck: 'pending', cddLevel: 'standard' },
    { id: '4', member: 'Alice Williams', idNumber: '9202145800086', status: 'flagged', riskScore: 75, submittedDate: '2026-01-09', pepCheck: 'match_found', cddLevel: 'enhanced' },
  ];

  const stats = {
    pending: 12,
    verified: 1089,
    flagged: 8,
    avgRiskScore: 18.5,
  };

  const getRiskBadge = (score: number) => {
    if (score === 0) return <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">Not Assessed</span>;
    if (score < 30) return <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Low Risk ({score})</span>;
    if (score < 60) return <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Medium Risk ({score})</span>;
    return <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">High Risk ({score})</span>;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      flagged: 'bg-red-100 text-red-800',
      failed: 'bg-gray-100 text-gray-800',
    };
    return <span className={`text-xs px-2 py-1 rounded ${styles[status as keyof typeof styles]}`}>{status.toUpperCase()}</span>;
  };

  const filteredRecords = kycRecords.filter(r => statusFilter === 'all' || r.status === statusFilter);

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">KYC & FICA Verification</h1>
          <p className="text-gray-600 mt-1">Know Your Customer and Financial Intelligence Centre Act compliance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Pending Verification</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.verified}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Flagged</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.flagged}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Avg Risk Score</p>
                <p className="text-3xl font-bold mt-1">{stats.avgRiskScore}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>KYC Records</CardTitle>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="flagged">Flagged</option>
                </select>
                <Button variant="outline" size="sm">Export Report</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Member</th>
                    <th className="text-left py-3 px-4 font-medium">ID Number</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Risk Score</th>
                    <th className="text-left py-3 px-4 font-medium">PEP Check</th>
                    <th className="text-left py-3 px-4 font-medium">CDD Level</th>
                    <th className="text-left py-3 px-4 font-medium">Submitted</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{record.member}</td>
                      <td className="py-3 px-4 font-mono text-sm">{record.idNumber}</td>
                      <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                      <td className="py-3 px-4">{getRiskBadge(record.riskScore)}</td>
                      <td className="py-3 px-4 text-sm">{record.pepCheck}</td>
                      <td className="py-3 px-4 text-sm">{record.cddLevel}</td>
                      <td className="py-3 px-4 text-sm">{record.submittedDate}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Review</Button>
                          {record.status === 'pending' && <Button size="sm">Verify</Button>}
                        </div>
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
