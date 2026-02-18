'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ComplianceRegisterPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  const [obligations] = useState([
    { id: '1', regulation: 'POPIA', obligation: 'Data Subject Request Processing', frequency: 'As needed', lastReview: '2024-01-10', nextReview: '2024-02-10', status: 'compliant' },
    { id: '2', regulation: 'Medical Schemes Act', obligation: 'PMB Compliance Reporting', frequency: 'Quarterly', lastReview: '2023-12-31', nextReview: '2024-03-31', status: 'compliant' },
  ]);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Register</h1>
          <p className="text-gray-600 mt-1">Obligations register and review schedule</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Compliance Obligations</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Regulation</th>
                    <th className="text-left py-3 px-4 font-medium">Obligation</th>
                    <th className="text-left py-3 px-4 font-medium">Frequency</th>
                    <th className="text-left py-3 px-4 font-medium">Last Review</th>
                    <th className="text-left py-3 px-4 font-medium">Next Review</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {obligations.map((obl) => (
                    <tr key={obl.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{obl.regulation}</td>
                      <td className="py-3 px-4">{obl.obligation}</td>
                      <td className="py-3 px-4">{obl.frequency}</td>
                      <td className="py-3 px-4">{new Date(obl.lastReview).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{new Date(obl.nextReview).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {obl.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Record of Processing Activities (RoPA)</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">POPIA-required documentation of all processing activities</p>
            <Button variant="outline">View RoPA</Button>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
