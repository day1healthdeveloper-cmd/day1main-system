'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  CreditCard, 
  Phone, 
  FileText, 
  Building2, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

export default function OperationsDashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operations Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}! Here's your operational overview</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            className="relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group cursor-pointer"
            style={{
              "--glow-color": "rgba(59, 130, 246, 1)",
              "--glow-color-via": "rgba(59, 130, 246, 0.075)",
              "--glow-color-to": "rgba(59, 130, 246, 0.2)",
            } as React.CSSProperties}
            onClick={() => router.push('/operations/debit-orders')}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none"></div>
            <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20"></div>
            <CardContent className="pt-6 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Debit Orders</p>
                  <p className="text-3xl font-bold mt-1">0</p>
                  <p className="text-xs text-gray-600 mt-1">Ready to process</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </div>

          <div 
            className="relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group cursor-pointer"
            style={{
              "--glow-color": "rgba(234, 179, 8, 1)",
              "--glow-color-via": "rgba(234, 179, 8, 0.075)",
              "--glow-color-to": "rgba(234, 179, 8, 0.2)",
            } as React.CSSProperties}
            onClick={() => router.push('/operations/call-centre')}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none"></div>
            <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20"></div>
            <CardContent className="pt-6 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Call Centre Queue</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-600">0</p>
                  <p className="text-xs text-gray-600 mt-1">Waiting calls</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </div>

          <div 
            className="relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group cursor-pointer"
            style={{
              "--glow-color": "rgba(16, 185, 129, 1)",
              "--glow-color-via": "rgba(16, 185, 129, 0.075)",
              "--glow-color-to": "rgba(16, 185, 129, 0.2)",
            } as React.CSSProperties}
            onClick={() => router.push('/operations/providers')}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none"></div>
            <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20"></div>
            <CardContent className="pt-6 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Provider Applications</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">0</p>
                  <p className="text-xs text-gray-600 mt-1">Pending approval</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </div>

          <div 
            className="relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group cursor-pointer"
            style={{
              "--glow-color": "rgba(239, 68, 68, 1)",
              "--glow-color-via": "rgba(239, 68, 68, 0.075)",
              "--glow-color-to": "rgba(239, 68, 68, 0.2)",
            } as React.CSSProperties}
            onClick={() => router.push('/operations/arrears')}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none"></div>
            <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20"></div>
            <CardContent className="pt-6 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Policies in Arrears</p>
                  <p className="text-3xl font-bold mt-1 text-red-600">0</p>
                  <p className="text-xs text-gray-600 mt-1">Require action</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </div>
        </div>

        {/* Operational Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Member Queries</p>
                  <p className="text-3xl font-bold mt-1">0</p>
                  <p className="text-xs text-gray-500 mt-1">Resolved today</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Claims Processed</p>
                  <p className="text-2xl font-bold mt-1">0</p>
                  <p className="text-xs text-gray-500 mt-1">Today</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Broker Requests</p>
                  <p className="text-2xl font-bold mt-1">0</p>
                  <p className="text-xs text-gray-500 mt-1">Pending</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">System Uptime</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">100%</p>
                  <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button 
                className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
                onClick={() => router.push('/operations/debit-orders')}
              >
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-medium">Debit Orders</p>
                <p className="text-xs text-gray-500">Process payments</p>
              </button>

              <button 
                className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
                onClick={() => router.push('/operations/call-centre')}
              >
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-medium">Call Centre</p>
                <p className="text-xs text-gray-500">Member support</p>
              </button>

              <button 
                className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
                onClick={() => router.push('/operations/providers')}
              >
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-medium">Providers</p>
                <p className="text-xs text-gray-500">Manage providers</p>
              </button>

              <button 
                className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
                onClick={() => router.push('/operations/reports')}
              >
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-medium">Reports</p>
                <p className="text-xs text-gray-500">Operational reports</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest operational events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs mt-1">Activity will appear here as operations occur</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>Items requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50 text-green-500" />
                <p className="text-sm">All systems operational</p>
                <p className="text-xs mt-1">No alerts at this time</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Key operational metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Debit Order Success Rate</span>
                  <span className="font-medium">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Call Wait Time</span>
                  <span className="font-medium">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Claims Processing Time</span>
                  <span className="font-medium">N/A</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Satisfaction</span>
                  <span className="font-medium">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Provider Response Time</span>
                  <span className="font-medium">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Policy Lapse Rate</span>
                  <span className="font-medium">0%</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Members</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Providers</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Brokers</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
