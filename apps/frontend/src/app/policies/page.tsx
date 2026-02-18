'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PoliciesPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Policies</h1>
          <p className="text-gray-600 mt-1">
            View and manage your active policies
          </p>
        </div>

        {/* Active Policies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Policy 1 */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Comprehensive Medical Plan</CardTitle>
                  <CardDescription>Policy #POL-2024-001234</CardDescription>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Digital Membership Card */}
              <div className="bg-gradient-to-br from-primary to-blue-600 rounded-lg p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm opacity-90">Member</p>
                    <p className="text-lg font-bold">{user.firstName} {user.lastName}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold">D1</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="opacity-90">Member Number</p>
                    <p className="font-mono font-semibold">M-2024-5678</p>
                  </div>
                  <div>
                    <p className="opacity-90">Plan</p>
                    <p className="font-semibold">Comprehensive</p>
                  </div>
                </div>
              </div>

              {/* Policy Details */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Premium</span>
                  <span className="font-medium">R2,450 / month</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-medium">1 Jan 2024</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Renewal Date</span>
                  <span className="font-medium">1 Jan 2025</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Covered Members</span>
                  <span className="font-medium">3 (Principal + 2 Dependants)</span>
                </div>
              </div>

              {/* Covered Members */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-900 mb-3">Covered Members</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.firstName?.[0] || 'U'}{user.lastName?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.firstName || 'User'} {user.lastName || ''}</p>
                      <p className="text-xs text-gray-500">Principal Member</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      JD
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Jane Doe</p>
                      <p className="text-xs text-gray-500">Spouse</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      TD
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Tom Doe</p>
                      <p className="text-xs text-gray-500">Child</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  View Benefits
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Download Card
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Policy 2 */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Gap Cover Plan</CardTitle>
                  <CardDescription>Policy #POL-2024-001235</CardDescription>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Digital Membership Card */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm opacity-90">Member</p>
                    <p className="text-lg font-bold">{user.firstName} {user.lastName}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold">D1</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="opacity-90">Member Number</p>
                    <p className="font-mono font-semibold">M-2024-5678</p>
                  </div>
                  <div>
                    <p className="opacity-90">Plan</p>
                    <p className="font-semibold">Gap Cover</p>
                  </div>
                </div>
              </div>

              {/* Policy Details */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Premium</span>
                  <span className="font-medium">R450 / month</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-medium">1 Jan 2024</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Renewal Date</span>
                  <span className="font-medium">1 Jan 2025</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Coverage Limit</span>
                  <span className="font-medium">R500,000 per year</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  View Benefits
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Download Card
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policy Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Documents</CardTitle>
            <CardDescription>Download your policy documents and certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Policy Schedule</p>
                    <p className="text-sm text-gray-500">Comprehensive Medical Plan</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Certificate of Cover</p>
                    <p className="text-sm text-gray-500">Valid until 31 Dec 2024</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Benefit Guide</p>
                    <p className="text-sm text-gray-500">2024 Edition</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
