'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { User, ArrowUpCircle, Eye, TrendingUp } from 'lucide-react';

export default function CallCentreDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    newMembers: 0,
    planUpgrades: 0,
    dependantsAdded: 0,
    totalPending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load applications
      const appResponse = await fetch('/api/admin/applications');
      const appData = await appResponse.json();
      const newMembers = appData.applications?.filter((app: any) => 
        app.status === 'submitted' || app.status === 'under_review'
      ).length || 0;

      // Load upgrade requests
      const upgradeResponse = await fetch('/api/plus1/upgrade-requests?status=pending');
      const upgradeData = await upgradeResponse.json();
      const planUpgrades = upgradeData.stats?.pending || 0;

      // Load dependant requests
      const dependantResponse = await fetch('/api/plus1/dependant-requests?status=pending');
      const dependantData = await dependantResponse.json();
      const dependantsAdded = dependantData.requests?.length || 0;

      setStats({
        newMembers,
        planUpgrades,
        dependantsAdded,
        totalPending: newMembers + planUpgrades + dependantsAdded
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Call Centre Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of member support activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Members</p>
                <p className="text-3xl font-bold text-blue-600">{stats.newMembers}</p>
                <p className="text-xs text-gray-500 mt-1">Pending applications</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plan Upgrades</p>
                <p className="text-3xl font-bold text-purple-600">{stats.planUpgrades}</p>
                <p className="text-xs text-gray-500 mt-1">Pending verification</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dependants Added</p>
                <p className="text-3xl font-bold text-green-600">{stats.dependantsAdded}</p>
                <p className="text-xs text-gray-500 mt-1">Pending verification</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pending</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalPending}</p>
                <p className="text-xs text-gray-500 mt-1">All requests</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/call-centre/support')}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Member Support</h3>
              <p className="text-sm text-gray-600">Handle member applications and requests</p>
              {stats.totalPending > 0 && (
                <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                  {stats.totalPending} pending
                </span>
              )}
            </button>
            <button
              onClick={() => router.push('/call-centre/members')}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Member Lookup</h3>
              <p className="text-sm text-gray-600">Search and view member information</p>
            </button>
            <button
              onClick={() => router.push('/call-centre/tickets')}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Support Tickets</h3>
              <p className="text-sm text-gray-600">Manage support tickets and queries</p>
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Activity</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Calls Handled</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Response Time</span>
                <span className="font-semibold text-gray-900">0m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Members Assisted</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
