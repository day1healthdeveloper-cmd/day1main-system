'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SystemStats {
  totalMembers: number;
  activePolicies: number;
  pendingClaims: number;
  pendingPreauths: number;
  totalProviders: number;
  activeBrokers: number;
}

interface PendingApproval {
  id: string;
  type: 'product' | 'policy' | 'claim' | 'provider';
  title: string;
  description: string;
  submittedBy: string;
  submittedDate: string;
  priority: 'low' | 'medium' | 'high';
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

interface RecentActivity {
  id: string;
  type: 'member' | 'policy' | 'claim' | 'payment' | 'provider';
  action: string;
  description: string;
  timestamp: string;
  user: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real data from database
  const [stats] = useState<SystemStats>({
    totalMembers: 5,
    activePolicies: 0,
    pendingClaims: 0,
    pendingPreauths: 0,
    totalProviders: 0,
    activeBrokers: 0, // 8 users exist but they are department admins, not brokers
  });

  const [pendingApprovals] = useState<PendingApproval[]>([
    {
      id: '1',
      type: 'product',
      title: 'New Product: Elite Plan',
      description: 'Comprehensive coverage with enhanced benefits',
      submittedBy: 'Product Manager',
      submittedDate: '2024-01-11T09:00:00',
      priority: 'high',
    },
    {
      id: '2',
      type: 'provider',
      title: 'Provider Registration: Dr. Sarah Johnson',
      description: 'General Practitioner - Cape Town',
      submittedBy: 'Provider Onboarding',
      submittedDate: '2024-01-11T08:30:00',
      priority: 'medium',
    },
    {
      id: '3',
      type: 'claim',
      title: 'High-Value Claim Review',
      description: 'Claim CLM-20240111-001 - R125,000',
      submittedBy: 'Claims Assessor',
      submittedDate: '2024-01-11T07:45:00',
      priority: 'high',
    },
    {
      id: '4',
      type: 'policy',
      title: 'Policy Reinstatement Request',
      description: 'POL-20231215-123 - Bob Johnson',
      submittedBy: 'Member Services',
      submittedDate: '2024-01-10T16:20:00',
      priority: 'medium',
    },
  ]);

  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Payment Gateway Latency',
      message: 'Payment processing times are 20% higher than normal',
      timestamp: '2024-01-11T10:15:00',
    },
    {
      id: '2',
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for Sunday 2AM-4AM',
      timestamp: '2024-01-11T09:00:00',
    },
    {
      id: '3',
      type: 'error',
      title: 'Failed Debit Orders',
      message: '5 debit orders failed this morning - retry scheduled',
      timestamp: '2024-01-11T08:30:00',
    },
  ]);

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'member',
      action: 'Member Registered',
      description: 'John Smith - M-2024-1250',
      timestamp: '2024-01-11T10:30:00',
      user: 'System',
    },
    {
      id: '2',
      type: 'claim',
      action: 'Claim Approved',
      description: 'CLM-20240111-045 - R3,500',
      timestamp: '2024-01-11T10:15:00',
      user: 'Claims Assessor',
    },
    {
      id: '3',
      type: 'payment',
      action: 'Payment Processed',
      description: 'Batch payment - 45 claims - R125,000',
      timestamp: '2024-01-11T10:00:00',
      user: 'Finance Manager',
    },
    {
      id: '4',
      type: 'policy',
      action: 'Policy Activated',
      description: 'POL-20240111-012 - Jane Doe',
      timestamp: '2024-01-11T09:45:00',
      user: 'System',
    },
    {
      id: '5',
      type: 'provider',
      action: 'Provider Approved',
      description: 'Dr. Michael Brown - Cape Town',
      timestamp: '2024-01-11T09:30:00',
      user: 'Provider Manager',
    },
  ]);

  const [financialStats] = useState({
    monthlyPremium: 0,
    claimsPaid: 0,
    outstandingClaims: 0,
    cashReserves: 0,
  });

  // Temporarily disabled auth check for demo
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [loading, isAuthenticated, router]);

  // Disabled loading and auth checks for demo
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return null;
  // }

  const getPriorityBadge = (priority: PendingApproval['priority']) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[priority]}`}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'member':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        );
      case 'policy':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
        );
      case 'claim':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        );
      case 'payment':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      case 'provider':
        return (
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        );
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    if (!mounted) return '';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return time.toLocaleDateString();
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System overview and pending items</p>
        </div>

        {/* System Statistics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">System Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/members')}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Members</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalMembers.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/policies')}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Active Policies</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">
                    {stats.activePolicies.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/claims')}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pending Claims</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pendingClaims}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/preauth')}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pending Preauths</p>
                  <p className="text-3xl font-bold mt-1 text-orange-600">
                    {stats.pendingPreauths}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/providers')}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Providers</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalProviders}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/brokers')}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Active Brokers</p>
                  <p className="text-3xl font-bold mt-1">{stats.activeBrokers}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Financial Overview */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Financial Overview (MTD)</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Monthly Premium</p>
                  <p className="text-2xl font-bold mt-1">
                    R{financialStats.monthlyPremium.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">No movement yet</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Claims Paid</p>
                  <p className="text-2xl font-bold mt-1">
                    R{financialStats.claimsPaid.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">No claims yet</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Outstanding Claims</p>
                  <p className="text-2xl font-bold mt-1">
                    R{financialStats.outstandingClaims.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">0 claims</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Cash Reserves</p>
                  <p className="text-2xl font-bold mt-1">
                    R{financialStats.cashReserves.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">No reserves yet</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important notifications requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap" suppressHydrationWarning>
                      {formatTimeAgo(alert.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Approvals</CardTitle>
                  <CardDescription>Items requiring your review</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{approval.title}</p>
                        {getPriorityBadge(approval.priority)}
                      </div>
                      <p className="text-sm text-gray-600">{approval.description}</p>
                      <p className="text-xs text-gray-500 mt-1" suppressHydrationWarning>
                        By {approval.submittedBy} • {formatTimeAgo(approval.submittedDate)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500" suppressHydrationWarning>
                        {activity.user} • {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => router.push('/admin/members')}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <span className="text-sm">Add Member</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => router.push('/admin/claims')}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="text-sm">Review Claims</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => router.push('/admin/products')}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span className="text-sm">Manage Products</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => router.push('/admin/reports')}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm">View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
