'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CallCentreMembersPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && !user.roles.includes('call_centre_agent')) {
      router.push('/dashboard');
      return;
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Lookup</h1>
          <p className="text-gray-600 mt-1">Search for members by name, ID, or policy number</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Members</CardTitle>
            <CardDescription>Enter member details to find their information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name, ID number, email, or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button>Search</Button>
              </div>
              
              <div className="text-center py-12 text-gray-500">
                <p>Enter search criteria to find members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
