'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RegulatoryReportsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  const [cmsReports] = useState([
    { id: '1', name: 'PMB Reporting Dashboard', description: 'Prescribed Minimum Benefits compliance', frequency: 'Monthly' },
    { id: '2', name: 'Claims Turnaround Time', description: 'Claims processing performance', frequency: 'Monthly' },
    { id: '3', name: 'Complaints & Disputes Statistics', description: 'Member complaints tracking', frequency: 'Quarterly' },
  ]);

  const [fscaReports] = useState([
    { id: '1', name: 'Policy Register', description: 'All active insurance policies', frequency: 'Monthly' },
    { id: '2', name: 'Claims Register', description: 'All claims processed', frequency: 'Monthly' },
    { id: '3', name: 'Conduct Metrics', description: 'TCF and conduct indicators', frequency: 'Quarterly' },
  ]);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Regulatory Reports</h1>
          <p className="text-gray-600 mt-1">CMS, FSCA/PA, and SARS submissions</p>
        </div>

        <Card>
          <CardHeader><CardTitle>CMS Reports (Medical Scheme Mode)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cmsReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-gray-600">{report.description}</p>
                    <p className="text-xs text-gray-500">Frequency: {report.frequency}</p>
                  </div>
                  <Button size="sm" variant="outline">Generate</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>FSCA/PA Reports (Insurance Mode)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fscaReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-gray-600">{report.description}</p>
                    <p className="text-xs text-gray-500">Frequency: {report.frequency}</p>
                  </div>
                  <Button size="sm" variant="outline">Generate</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>SARS Submissions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">Third-Party Data Submission</p>
                  <p className="text-sm text-gray-600">Annual medical scheme contributions</p>
                  <p className="text-xs text-gray-500">Due: February 28, 2024</p>
                </div>
                <Button size="sm" variant="outline">Generate</Button>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Submission History</p>
                <p className="text-sm text-blue-700 mt-1">Last submission: 2023-02-25 (File hash: abc123...)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
