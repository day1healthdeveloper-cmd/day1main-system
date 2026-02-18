'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, CreditCard, FileText } from 'lucide-react';

export default function FinanceDashboardPage() {
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}! Here's your financial overview</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            className="relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group"
            style={{
              "--glow-color": "rgba(34, 211, 238, 1)",
              "--glow-color-via": "rgba(34, 211, 238, 0.075)",
              "--glow-color-to": "rgba(34, 211, 238, 0.2)",
            } as React.CSSProperties}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none"></div>
            <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20"></div>
            <CardContent className="pt-6 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold mt-1">R 0</p>
                  <p className="text-xs text-gray-500 mt-1">No revenue yet</p>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </div>

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
                  <p className="text-sm text-gray-600">Outstanding Payments</p>
                  <p className="text-3xl font-bold mt-1">R 0</p>
                  <p className="text-xs text-gray-600 mt-1">0 pending</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </div>

          <div 
            className="relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group"
            style={{
              "--glow-color": "rgba(59, 130, 246, 1)",
              "--glow-color-via": "rgba(59, 130, 246, 0.075)",
              "--glow-color-to": "rgba(59, 130, 246, 0.2)",
            } as React.CSSProperties}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none"></div>
            <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20"></div>
            <CardContent className="pt-6 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reconciliation Status</p>
                  <p className="text-3xl font-bold mt-1 text-blue-600">100%</p>
                  <p className="text-xs text-gray-600 mt-1">Up to date</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </div>

          <div 
            className="relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group"
            style={{
              "--glow-color": "rgba(147, 51, 234, 1)",
              "--glow-color-via": "rgba(147, 51, 234, 0.075)",
              "--glow-color-to": "rgba(147, 51, 234, 0.2)",
            } as React.CSSProperties}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none"></div>
            <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20"></div>
            <CardContent className="pt-6 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Journal Entries</p>
                  <p className="text-3xl font-bold mt-1">0</p>
                  <p className="text-xs text-gray-600 mt-1">This month</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
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
              <button className="p-4 border rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-colors text-left group">
                <div className="w-10 h-10 bg-cyan-100 group-hover:bg-cyan-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <FileText className="w-5 h-5 text-cyan-600" />
                </div>
                <p className="font-medium">View Ledger</p>
                <p className="text-xs text-gray-500">General ledger</p>
              </button>

              <button className="p-4 border rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-colors text-left group">
                <div className="w-10 h-10 bg-cyan-100 group-hover:bg-cyan-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <DollarSign className="w-5 h-5 text-cyan-600" />
                </div>
                <p className="font-medium">Reconciliation</p>
                <p className="text-xs text-gray-500">Bank reconciliation</p>
              </button>

              <button className="p-4 border rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-colors text-left group">
                <div className="w-10 h-10 bg-cyan-100 group-hover:bg-cyan-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <CreditCard className="w-5 h-5 text-cyan-600" />
                </div>
                <p className="font-medium">Payments</p>
                <p className="text-xs text-gray-500">Process payments</p>
              </button>

              <button className="p-4 border rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-colors text-left group">
                <div className="w-10 h-10 bg-cyan-100 group-hover:bg-cyan-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <FileText className="w-5 h-5 text-cyan-600" />
                </div>
                <p className="font-medium">Trial Balance</p>
                <p className="text-xs text-gray-500">View reports</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
