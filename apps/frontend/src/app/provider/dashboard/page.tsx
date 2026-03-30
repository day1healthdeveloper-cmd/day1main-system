'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProviderDashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    totalApproved: 0,
    totalPending: 0
  });
  const [recentClaims, setRecentClaims] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProviderClaims();
    }
  }, [isAuthenticated, user]);

  const fetchProviderClaims = async () => {
    if (!user) return;
    
    try {
      setLoadingData(true);
      const response = await fetch(`/api/provider/claims?providerId=${user.id}&limit=5`);
      const data = await response.json();
      
      setStats(data.stats || {
        totalClaims: 0,
        pendingClaims: 0,
        approvedClaims: 0,
        totalApproved: 0,
        totalPending: 0
      });
      setRecentClaims(data.claims || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const pendingItems: any[] = [];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, Dr. {user.lastName}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Claims This Month</CardDescription>
              <CardTitle className="text-3xl">{stats.totalClaims}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats.totalClaims === 0 ? 'No claims yet' : 'Total submitted'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Claims</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{stats.pendingClaims}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats.pendingClaims === 0 ? 'No pending claims' : 'Awaiting review'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approved Amount</CardDescription>
              <CardTitle className="text-3xl">R{stats.totalApproved.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats.approvedClaims} claims approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Amount</CardDescription>
              <CardTitle className="text-3xl">R{stats.totalPending.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Under review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Check Eligibility</CardTitle>
              <CardDescription>Verify patient coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => router.push('/provider/eligibility')}>Check Now</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submit Claim</CardTitle>
              <CardDescription>File a new claim</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => router.push('/provider/claims/submit')}>New Claim</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Pre-Auth</CardTitle>
              <CardDescription>Submit pre-authorization</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => router.push('/provider/preauth/submit')}>New Request</Button>
            </CardContent>
          </Card>
        </div>

        {/* Pending Items */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Items</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingItems.length > 0 ? (
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {item.type}
                        </span>
                        <p className="font-medium">{item.patient}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="text-xs text-gray-500">Procedure</p>
                          <p>{item.procedure}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p>{item.date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="font-medium">R{item.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <Button size="sm">Review</Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No pending items
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Claims */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Claims</CardTitle>
                <CardDescription>Your latest claim submissions</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/provider/claims/history')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentClaims.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No claims submitted yet</p>
                <Button className="mt-4" onClick={() => router.push('/provider/claims/submit')}>
                  Submit Your First Claim
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium">{claim.claim_type}</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            claim.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : claim.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : claim.status === 'pended'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {claim.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="text-xs text-gray-500">Claim Number</p>
                          <p className="font-mono">{claim.claim_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Patient</p>
                          <p>{claim.member?.first_name} {claim.member?.last_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p>{new Date(claim.service_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="font-medium">R{parseFloat(claim.claimed_amount).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/provider/claims/history`)}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Claims by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Approved</span>
                  <span className="font-medium">15 claims</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-medium">5 claims</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Paid</span>
                  <span className="font-medium">4 claims</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Submitted</span>
                  <span className="font-medium">R22,700</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Received</span>
                  <span className="font-medium text-green-600">R18,450</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Outstanding</span>
                  <span className="font-medium text-yellow-600">R4,250</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
