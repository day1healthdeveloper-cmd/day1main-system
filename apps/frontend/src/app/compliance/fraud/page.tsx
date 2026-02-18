'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FraudRiskPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  const [investigations] = useState([
    { id: '1', caseNumber: 'INV-20240111-001', type: 'Duplicate Member', subject: 'John Smith', riskScore: 85, status: 'open', openedDate: '2024-01-11' },
    { id: '2', caseNumber: 'INV-20240110-045', type: 'Provider Outlier', subject: 'Dr. ABC Clinic', riskScore: 72, status: 'investigating', openedDate: '2024-01-10' },
  ]);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  const getStatusBadge = (status: string) => {
    const styles = { open: 'bg-yellow-100 text-yellow-800', investigating: 'bg-blue-100 text-blue-800', closed: 'bg-gray-100 text-gray-800', escalated: 'bg-red-100 text-red-800' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>{status.toUpperCase()}</span>;
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fraud & Risk Management</h1>
          <p className="text-gray-600 mt-1">Investigations, risk flags, and anomaly reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Open Cases</p><p className="text-3xl font-bold mt-1 text-yellow-600">{investigations.filter(i => i.status === 'open').length}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Investigating</p><p className="text-3xl font-bold mt-1 text-blue-600">{investigations.filter(i => i.status === 'investigating').length}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">High Risk</p><p className="text-3xl font-bold mt-1 text-red-600">{investigations.filter(i => i.riskScore > 80).length}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Avg Resolution</p><p className="text-3xl font-bold mt-1">7d</p></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Investigation Queue</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Case Number</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Subject</th>
                    <th className="text-center py-3 px-4 font-medium">Risk Score</th>
                    <th className="text-left py-3 px-4 font-medium">Opened</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investigations.map((inv) => (
                    <tr key={inv.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{inv.caseNumber}</td>
                      <td className="py-3 px-4">{inv.type}</td>
                      <td className="py-3 px-4 font-medium">{inv.subject}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-bold ${inv.riskScore > 80 ? 'text-red-600' : inv.riskScore > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {inv.riskScore}
                        </span>
                      </td>
                      <td className="py-3 px-4">{new Date(inv.openedDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{getStatusBadge(inv.status)}</td>
                      <td className="py-3 px-4"><Button size="sm" variant="outline">Investigate</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Anomaly Reports</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Claim Frequency Anomaly</p>
                  <p className="text-sm text-gray-600">Provider PRV-123 - 300% above average</p>
                </div>
                <Button size="sm" variant="outline">Review</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Duplicate Bank Account</p>
                  <p className="text-sm text-gray-600">3 members with same bank details</p>
                </div>
                <Button size="sm" variant="outline">Review</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
