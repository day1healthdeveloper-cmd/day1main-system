'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FraudPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const fraudCases = [
    { id: 'FR-001', claim: 'CLM-20240111-001', member: 'John Smith', riskScore: 85, indicators: 3, status: 'investigating', date: '2026-01-10' },
    { id: 'FR-002', claim: 'CLM-20240110-002', member: 'Sarah Johnson', riskScore: 92, indicators: 5, status: 'flagged', date: '2026-01-09' },
    { id: 'FR-003', claim: 'CLM-20240109-003', member: 'Mike Brown', riskScore: 65, indicators: 2, status: 'cleared', date: '2026-01-08' },
    { id: 'FR-004', claim: 'CLM-20240108-004', member: 'Lisa Davis', riskScore: 78, indicators: 4, status: 'investigating', date: '2026-01-07' },
    { id: 'FR-005', claim: 'CLM-20240107-005', member: 'Tom Wilson', riskScore: 95, indicators: 6, status: 'confirmed', date: '2026-01-06' },
  ];

  const stats = {
    totalCases: 47,
    flagged: 12,
    investigating: 8,
    confirmed: 3,
  };

  const getRiskColor = (score: number) => {
    if (score >= 90) return 'text-red-600';
    if (score >= 75) return 'text-orange-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'flagged': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-red-100 text-red-800';
      case 'cleared': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCases = fraudCases.filter(fc =>
    fc.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fc.claim.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fraud Detection</h1>
          <p className="text-gray-600 mt-1">Investigate potential fraud cases</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Cases</p>
                <p className="text-3xl font-bold mt-1">{stats.totalCases}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Flagged</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.flagged}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Investigating</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.investigating}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Confirmed Fraud</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.confirmed}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Fraud Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Case ID, claim ID, or member name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Fraud Cases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Fraud Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Case ID</th>
                    <th className="text-left py-3 px-4 font-medium">Claim ID</th>
                    <th className="text-left py-3 px-4 font-medium">Member</th>
                    <th className="text-center py-3 px-4 font-medium">Risk Score</th>
                    <th className="text-center py-3 px-4 font-medium">Indicators</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((fc) => (
                    <tr key={fc.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{fc.id}</td>
                      <td className="py-3 px-4 font-mono text-sm">{fc.claim}</td>
                      <td className="py-3 px-4">{fc.member}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-2xl font-bold ${getRiskColor(fc.riskScore)}`}>
                          {fc.riskScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                          {fc.indicators} flags
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(fc.status)}`}>
                          {fc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{fc.date}</td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">Investigate</Button>
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
