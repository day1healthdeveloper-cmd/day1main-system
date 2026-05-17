'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone } from 'lucide-react';

export default function OperationsCallCentrePage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Call Centre Queue</h2>
          <p className="text-gray-600 mt-1">Review and process active member support work</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Member Support Queue</CardTitle>
            <CardDescription>Legacy request queues have been retired from this view.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No active request queue configured</p>
              <p className="text-xs mt-1">Use Member Support for submitted member applications.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
