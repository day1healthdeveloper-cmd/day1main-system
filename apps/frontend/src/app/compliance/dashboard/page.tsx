'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ComplianceMetric {
  category: string;
  status: 'compliant' | 'warning' | 'critical';
  score: number;
  issues: number;
}

export default function ComplianceDashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  const [metrics] = useState<ComplianceMetric[]>([
    { category: 'POPIA Compliance', status: 'compliant', score: 100, issues: 0 },
    { category: 'FICA Compliance', status: 'compliant', score: 100, issues: 0 },
    { category: 'Medical Schemes Act', status: 'compliant', score: 100, issues: 0 },
    { category: 'FAIS Compliance', status: 'compliant', score: 100, issues: 0 },
  ]);

  const [stats] = useState({
    pendingDSR: 0,
    openBreaches: 0,
    pendingInvestigations: 0,
    vendorReviews: 0,
    complianceScore: 100,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  const getStatusColor = (status: ComplianceMetric['status']) => {
    return status === 'compliant' ? 'text-green-600' : status === 'warning' ? 'text-yellow-600' : 'text-red-600';
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor compliance status and pending items</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Overall Score</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.complianceScore}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg" onClick={() => router.push('/compliance/popia')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Pending DSR</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pendingDSR}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg" onClick={() => router.push('/compliance/popia')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Open Breaches</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.openBreaches}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg" onClick={() => router.push('/compliance/fraud')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Investigations</p>
                <p className="text-3xl font-bold mt-1 text-orange-600">{stats.pendingInvestigations}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg" onClick={() => router.push('/compliance/vendors')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Vendor Reviews</p>
                <p className="text-3xl font-bold mt-1">{stats.vendorReviews}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Metrics</CardTitle>
            <CardDescription>Current compliance status by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.map((metric) => (
                <div key={metric.category} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{metric.category}</h3>
                    <p className="text-sm text-gray-600">{metric.issues} open issues</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>{metric.score}%</p>
                      <p className="text-xs text-gray-500">{metric.status.toUpperCase()}</p>
                    </div>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/compliance/popia')}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  POPIA Management
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/compliance/fraud')}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Fraud & Risk
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/compliance/vendors')}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Vendor Management
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/compliance/register')}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Compliance Register
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity</p>
                <p className="text-sm mt-1">Activity will appear here as compliance events occur</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
