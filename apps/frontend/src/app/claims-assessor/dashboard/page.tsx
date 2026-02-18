'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function ClaimsAssessorDashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claims Assessor Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}! Here's your claims overview</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            className="relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group"
            style={{
              "--glow-color": "rgba(16, 185, 129, 1)",
              "--glow-color-via": "rgba(16, 185, 129, 0.075)",
              "--glow-color-to": "rgba(16, 185, 129, 0.2)",
            } as React.CSSProperties}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none"></div>
            <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20"></div>
            <CardContent className="pt-6 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Claims</p>
                  <p className="text-3xl font-bold mt-1">0</p>
                  <p className="text-xs text-gray-600 mt-1">No claims yet</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </div>

          <div 
            className="relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group"
            style={{
              "--glow-color": "rgba(234, 179, 8, 1)",
              "--glow-color-via": "rgba(234, 179, 8, 0.075)",
              "--glow-color-to": "rgba(234, 179, 8, 0.2)",
            } as React.CSSProperties}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none"></div>
            <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20"></div>
            <CardContent className="pt-6 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pre-Auth Requests</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-600">0</p>
                  <p className="text-xs text-gray-600 mt-1">No requests</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </div>

          <div 
            className="relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group"
            style={{
              "--glow-color": "rgba(239, 68, 68, 1)",
              "--glow-color-via": "rgba(239, 68, 68, 0.075)",
              "--glow-color-to": "rgba(239, 68, 68, 0.2)",
            } as React.CSSProperties}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none"></div>
            <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20"></div>
            <CardContent className="pt-6 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fraud Cases</p>
                  <p className="text-3xl font-bold mt-1 text-red-600">0</p>
                  <p className="text-xs text-gray-600 mt-1">No cases</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </div>

          <div 
            className="relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group"
            style={{
              "--glow-color": "rgba(34, 197, 94, 1)",
              "--glow-color-via": "rgba(34, 197, 94, 0.075)",
              "--glow-color-to": "rgba(34, 197, 94, 0.2)",
            } as React.CSSProperties}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none"></div>
            <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20"></div>
            <CardContent className="pt-6 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved Today</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">0</p>
                  <p className="text-xs text-gray-600 mt-1">R 0 total</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="p-4 border rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-left group">
                <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <p className="font-medium">Claims Queue</p>
                <p className="text-xs text-gray-500">Review claims</p>
              </button>

              <button className="p-4 border rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-left group">
                <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <p className="font-medium">Pre-Auth</p>
                <p className="text-xs text-gray-500">Authorization requests</p>
              </button>

              <button className="p-4 border rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-left group">
                <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <AlertTriangle className="w-5 h-5 text-green-600" />
                </div>
                <p className="font-medium">Fraud Cases</p>
                <p className="text-xs text-gray-500">Investigate fraud</p>
              </button>

              <button className="p-4 border rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-left group">
                <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="font-medium">My Claims</p>
                <p className="text-xs text-gray-500">Assigned to me</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Claims */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent claims</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
