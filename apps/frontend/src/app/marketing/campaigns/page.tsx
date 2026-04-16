'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone } from 'lucide-react';

export default function MarketingCampaignsPage() {
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
            <p className="text-gray-600 mt-1">Create and manage marketing campaigns</p>
          </div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => router.push('/marketing/campaigns/new')}
          >
            <Megaphone className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Coming Soon Card */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Management System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 mx-auto mb-4 text-purple-600 opacity-50" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600 mb-6">
                The campaign management system is currently under development.
              </p>
              <div className="max-w-md mx-auto text-left space-y-2">
                <p className="text-sm text-gray-600">✓ Multi-channel campaigns (Email, SMS, WhatsApp)</p>
                <p className="text-sm text-gray-600">✓ Campaign templates and automation</p>
                <p className="text-sm text-gray-600">✓ A/B testing and optimization</p>
                <p className="text-sm text-gray-600">✓ Real-time performance tracking</p>
              </div>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => router.push('/marketing/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
