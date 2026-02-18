'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VendorManagementPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  const [vendors] = useState([
    { id: '1', name: 'PayFast', category: 'Payment Gateway', riskLevel: 'low', lastReview: '2023-12-15', nextReview: '2024-12-15', status: 'active' },
    { id: '2', name: 'AWS', category: 'Cloud Infrastructure', riskLevel: 'medium', lastReview: '2023-11-20', nextReview: '2024-11-20', status: 'active' },
  ]);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  const getRiskBadge = (risk: string) => {
    const styles = { low: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-red-100 text-red-800' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[risk as keyof typeof styles]}`}>{risk.toUpperCase()}</span>;
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
            <p className="text-gray-600 mt-1">Vendor register and risk assessments</p>
          </div>
          <Button>+ Add Vendor</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Vendor Register</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Vendor Name</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Risk Level</th>
                    <th className="text-left py-3 px-4 font-medium">Last Review</th>
                    <th className="text-left py-3 px-4 font-medium">Next Review</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{vendor.name}</td>
                      <td className="py-3 px-4">{vendor.category}</td>
                      <td className="py-3 px-4">{getRiskBadge(vendor.riskLevel)}</td>
                      <td className="py-3 px-4">{new Date(vendor.lastReview).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{new Date(vendor.nextReview).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm" variant="outline">Review</Button>
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
