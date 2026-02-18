'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function OperationalReportsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  const [reports] = useState([
    { id: '1', category: 'Claims', name: 'Claims Analytics Dashboard', description: 'Comprehensive claims analysis' },
    { id: '2', category: 'Claims', name: 'Claims by Provider', description: 'Provider-level claims breakdown' },
    { id: '3', category: 'Financial', name: 'Premium Collection Report', description: 'Monthly premium analysis' },
    { id: '4', category: 'Financial', name: 'Loss Ratio Analysis', description: 'Claims vs premium ratio' },
    { id: '5', category: 'Members', name: 'Member Movement Report', description: 'New, lapsed, and cancelled members' },
    { id: '6', category: 'Members', name: 'Member Demographics', description: 'Age, gender, and location analysis' },
  ]);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  const groupedReports = reports.reduce((acc, report) => {
    if (!acc[report.category]) acc[report.category] = [];
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, typeof reports>);

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operational Reports</h1>
          <p className="text-gray-600 mt-1">Claims, financial, and member analytics</p>
        </div>

        {Object.entries(groupedReports).map(([category, categoryReports]) => (
          <Card key={category}>
            <CardHeader><CardTitle>{category} Reports</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                    <Button size="sm" variant="outline">Generate</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SidebarLayout>
  );
}
