'use client';

import { useState, useEffect } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
// import { apiClient } from '@/lib/api-client'; // Removed - backend no longer exists

export default function BrokerCommunicationsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'members' | 'premium'>('name');

  useEffect(() => {
    // fetchBrokerGroups(); // Disabled - backend removed
    setLoading(false);
  }, []);

  const fetchBrokerGroups = async () => {
    // Backend removed - this feature is temporarily disabled
    return;
    /*
    try {
      const data = await apiClient.get('/netcash/groups');
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching broker groups:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
    */
  };

  const filteredGroups = (groups || [])
    .filter((g: any) => g.broker_group && g.broker_group.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a: any, b: any) => {
      if (sortBy === 'name') return a.broker_group.localeCompare(b.broker_group);
      if (sortBy === 'members') return b.member_count - a.member_count;
      if (sortBy === 'premium') return b.total_premium - a.total_premium;
      return 0;
    });

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Broker Communications</h1>
          <p className="text-gray-600 mt-2">Manage and communicate with broker groups</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">👥 Broker Groups</h2>
              <p className="text-sm text-gray-600 mt-1">Manage and monitor all broker groups</p>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="members">Sort by Members</option>
                <option value="premium">Sort by Premium</option>
              </select>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group: any) => (
            <div key={group.broker_group} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{group.broker_group}</h3>
                  <p className="text-sm text-gray-500">Broker Group</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  Active
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Members</span>
                  <span className="font-semibold">{group.member_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Premium</span>
                  <span className="font-semibold text-green-600">R{group.total_premium?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Arrears</span>
                  <span className="font-semibold text-orange-600">R{group.total_arrears?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-semibold text-purple-600">
                    {group.member_count > 0 ? ((group.active_count / group.member_count) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex gap-2">
                <button className="flex-1 text-sm text-blue-600 hover:text-blue-800 font-medium py-2 px-4 border border-blue-600 rounded hover:bg-blue-50">
                  Send Message
                </button>
                <button className="flex-1 text-sm text-gray-600 hover:text-gray-800 font-medium py-2 px-4 border border-gray-300 rounded hover:bg-gray-50">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">No broker groups found matching your search</p>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
