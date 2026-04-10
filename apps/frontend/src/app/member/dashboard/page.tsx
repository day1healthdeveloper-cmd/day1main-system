'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MemberData {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  plan_name: string;
  status: string;
  monthly_premium: number;
  next_debit_date: string;
  broker_code: string;
}

interface MemberStats {
  activeClaims: number;
  pendingClaims: number;
  totalClaimsPaid: number;
  lastPaymentDate: string;
  lastPaymentAmount: number;
}

export default function MemberDashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMemberData();
      fetchMemberStats();
    }
  }, [isAuthenticated, user]);

  const fetchMemberData = async () => {
    try {
      const response = await fetch('/api/member/profile');
      if (response.ok) {
        const data = await response.json();
        setMemberData(data);
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchMemberStats = async () => {
    try {
      const response = await fetch('/api/member/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching member stats:', error);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {memberData?.first_name || 'Member'}
              </h1>
              <p className="text-sm text-gray-600">
                Member Number: {memberData?.member_number || 'Loading...'}
              </p>
            </div>
            <Button onClick={() => router.push('/member/profile')}>
              View Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {memberData?.status === 'active' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-medium">Your policy is active and up to date</span>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-xl font-bold mt-1">{memberData?.plan_name || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Monthly Premium</p>
                <p className="text-xl font-bold mt-1 text-blue-600">
                  R{memberData?.monthly_premium ? parseFloat(memberData.monthly_premium.toString()).toLocaleString() : '0'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Active Claims</p>
                <p className="text-xl font-bold mt-1 text-orange-600">
                  {stats?.activeClaims || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Next Debit</p>
                <p className="text-xl font-bold mt-1">
                  {memberData?.next_debit_date ? new Date(memberData.next_debit_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Claims */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
              <CardDescription>Your latest claim submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>No recent claims</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.push('/member/claims/submit')}
                >
                  Submit a Claim
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/member/claims/submit')}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Submit a Claim
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/member/claims')}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View All Claims
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/member/documents')}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  My Documents
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/member/dependants')}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Manage Dependants
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Your payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Last Payment</p>
                  <p className="text-lg font-semibold">
                    {stats?.lastPaymentDate 
                      ? new Date(stats.lastPaymentDate).toLocaleDateString() 
                      : 'No payments yet'}
                  </p>
                  {stats?.lastPaymentAmount && (
                    <p className="text-sm text-gray-600">
                      R{parseFloat(stats.lastPaymentAmount.toString()).toLocaleString()}
                    </p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/member/payments')}
                >
                  View Payment History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Contact our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Call Centre</p>
                  <p className="text-lg font-semibold">0800 123 456</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold">support@day1health.co.za</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hours</p>
                  <p className="text-sm">Monday - Friday: 8am - 5pm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
