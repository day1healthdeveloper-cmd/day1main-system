'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { apiClient } from '@/lib/api-client';
import { TransactionsTab } from '@/components/netcash/TransactionsTab';
import { FailedPaymentsTab } from '@/components/netcash/FailedPaymentsTab';
import { ReconciliationTab } from '@/components/netcash/ReconciliationTab';
import { WebhooksTab } from '@/components/netcash/WebhooksTab';

type TabType = 'overview' | 'groups' | 'members' | 'transactions' | 'failed-payments' | 'refunds' | 'reconciliation' | 'webhooks' | 'reports' | 'batches';

export default function DebitOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [summary, setSummary] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [totalMembers, setTotalMembers] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  const handleViewGroupDetails = (groupName: string) => {
    setSelectedGroup(groupName);
    setActiveTab('members');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('🔵 fetchData: Starting...');
      
      // Call backend API directly using apiClient
      console.log('🔵 fetchData: Calling backend APIs directly...');

      const [summaryData, batchesData, groupsData] = await Promise.all([
        apiClient.get('/netcash/summary').catch(err => { console.error('Summary error:', err); return null as any; }),
        apiClient.get('/netcash/batches?limit=10').catch(err => { console.error('Batches error:', err); return [] as any[]; }),
        apiClient.get('/netcash/groups').catch(err => { console.error('Groups error:', err); return [] as any[]; }),
      ]);

      console.log('🔵 fetchData: Summary data:', summaryData);
      console.log('🔵 fetchData: Batches data:', batchesData);
      console.log('🔵 fetchData: Groups data:', groupsData);
      console.log('🔵 fetchData: Groups is array?', Array.isArray(groupsData));
      console.log('🔵 fetchData: Groups length:', Array.isArray(groupsData) ? groupsData.length : 0);

      setSummary(summaryData);
      setBatches(Array.isArray(batchesData) ? batchesData : []);
      setGroups(Array.isArray(groupsData) ? groupsData : []);
      
      // Set total members from summary
      if (summaryData && typeof summaryData === 'object' && 'total' in summaryData && typeof summaryData.total === 'number') {
        setTotalMembers(summaryData.total);
      }
      
      console.log(`🔵 fetchData: Loaded ${Array.isArray(groupsData) ? groupsData.length : 0} groups`);
      console.log(`🔵 fetchData: Total members: ${summaryData && typeof summaryData === 'object' && 'total' in summaryData ? summaryData.total : 0}`);
    } catch (error) {
      console.error('🔴 fetchData: Error:', error);
      setBatches([]);
      setGroups([]);
      setTotalMembers(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDebitOrders = () => {
    router.push('/operations/debit-orders/run');
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Debit Order Management</h1>
          <p className="text-gray-600 mt-2">Comprehensive debit order processing and group management</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-1 min-w-max">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'groups', label: 'Groups', icon: '👥' },
              { id: 'members', label: 'Members', icon: '👤' },
              { id: 'transactions', label: 'Transactions', icon: '💳' },
              { id: 'failed-payments', label: 'Failed', icon: '⚠️' },
              { id: 'refunds', label: 'Refunds', icon: '💸' },
              { id: 'reconciliation', label: 'Reconcile', icon: '🔄' },
              { id: 'webhooks', label: 'Webhooks', icon: '📡' },
              { id: 'reports', label: 'Reports', icon: '📈' },
              { id: 'batches', label: 'Batches', icon: '📋' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs transition-colors flex items-center gap-1
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab summary={summary} totalMembers={totalMembers} onRunDebitOrders={handleRunDebitOrders} processing={processing} />}
        {activeTab === 'groups' && <GroupsTab groups={groups} summary={summary} onViewDetails={handleViewGroupDetails} />}
        {activeTab === 'members' && <MembersTab groups={groups} selectedGroup={selectedGroup} />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'failed-payments' && <FailedPaymentsTab />}
        {activeTab === 'refunds' && <RefundsTab />}
        {activeTab === 'reconciliation' && <ReconciliationTab />}
        {activeTab === 'webhooks' && <WebhooksTab />}
        {activeTab === 'reports' && <ReportsTab summary={summary} />}
        {activeTab === 'batches' && <BatchesTab batches={batches} router={router} />}
      </div>
    </SidebarLayout>
  );
}

// Overview Tab Component
function OverviewTab({ summary, totalMembers, onRunDebitOrders, processing }: any) {
  return (
    <div className="space-y-6">
      {/* Monthly Run Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">📅 Monthly Debit Order Run</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Members</p>
            <p className="text-2xl font-bold text-blue-600">{totalMembers || summary?.total || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Active debit orders</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Monthly Premium</p>
            <p className="text-2xl font-bold text-green-600">
              R{summary?.totalPremium?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total collection</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Arrears</p>
            <p className="text-2xl font-bold text-orange-600">
              R{summary?.totalArrears?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Outstanding</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {summary?.total && summary.total > 0 ? ((summary?.byStatus?.active?.count || 0) / summary.total * 100).toFixed(1) : '0'}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Last month</p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Current Status Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summary?.byStatus &&
            Object.entries(summary.byStatus).map(([status, data]: [string, any]) => (
              <div key={status} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <p className="text-sm text-gray-600 capitalize font-medium">{status}</p>
                <p className="text-2xl font-bold mt-2">{data.count}</p>
                <p className="text-sm text-gray-500 mt-1">R{data.premium.toFixed(2)}</p>
                {data.arrears > 0 && (
                  <p className="text-xs text-red-600 mt-1">Arrears: R{data.arrears.toFixed(2)}</p>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">⏰ Next Debit Date</h3>
          <p className="text-3xl font-bold text-blue-600">
            {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">3 business days from now</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">🏦 Broker Groups</h3>
          <p className="text-3xl font-bold text-green-600">19</p>
          <p className="text-sm text-gray-500 mt-2">Active groups</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">💰 Collection Rate</h3>
          <p className="text-3xl font-bold text-purple-600">
            {summary?.total && summary.total > 0 ? ((summary?.byStatus?.active?.count || 0) / summary.total * 100).toFixed(1) : '0'}%
          </p>
          <p className="text-sm text-gray-500 mt-2">Current month</p>
        </div>
      </div>
    </div>
  );
}

// Groups Tab Component
function GroupsTab({ groups, summary, onViewDetails }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'members' | 'premium'>('name');

  console.log('GroupsTab rendered with groups:', groups);

  const filteredGroups = (groups || [])
    .filter((g: any) => g.broker_group && g.broker_group.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a: any, b: any) => {
      if (sortBy === 'name') return a.broker_group.localeCompare(b.broker_group);
      if (sortBy === 'members') return b.member_count - a.member_count;
      if (sortBy === 'premium') return b.total_premium - a.total_premium;
      return 0;
    });

  console.log('Filtered groups:', filteredGroups.length);

  return (
    <div className="space-y-6">
      {/* Header */}
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

            <div className="mt-4 pt-4 border-t">
              <button 
                onClick={() => onViewDetails(group.broker_group)}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">No groups found matching your search</p>
        </div>
      )}
    </div>
  );
}

// Members Tab Component
function MembersTab({ groups, selectedGroup }: { groups: any[], selectedGroup?: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarData, setCalendarData] = useState<any>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<{ date: Date; members: any[] } | null>(null);
  const [calendarGroupFilter, setCalendarGroupFilter] = useState<string>('');
  const [showMonthSummary, setShowMonthSummary] = useState(false);
  const [monthSummaryData, setMonthSummaryData] = useState<any>(null);
  const [filters, setFilters] = useState({
    brokerGroup: selectedGroup || '',
    status: '',
    search: '',
  });

  console.log('MembersTab: groups prop:', groups);
  console.log('MembersTab: groups length:', groups?.length);
  console.log('MembersTab: groups is array?', Array.isArray(groups));
  console.log('MembersTab: selectedGroup:', selectedGroup);

  // Update filters when selectedGroup changes
  useEffect(() => {
    if (selectedGroup) {
      setFilters(prev => ({ ...prev, brokerGroup: selectedGroup }));
    }
  }, [selectedGroup]);

  useEffect(() => {
    fetchMembers();
  }, [filters]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.brokerGroup) params.append('brokerGroup', filters.brokerGroup);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      params.append('limit', '50');

      console.log('Fetching members with params:', params.toString());
      const data = await apiClient.get(`/netcash/members?${params}`);
      console.log('Members data received:', data);
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyBatches = async (preSelectedGroup?: string) => {
    try {
      // Set the group filter if provided
      if (preSelectedGroup) {
        setCalendarGroupFilter(preSelectedGroup);
      }
      
      // Fetch all members to get their debit dates
      const allMembers = await apiClient.get('/netcash/members?limit=1000');
      
      // Filter members by group if specified
      const filteredMembers = preSelectedGroup 
        ? allMembers.filter((m: any) => m.broker_group === preSelectedGroup)
        : allMembers;
      
      // Group by month and day for the entire year
      const yearData = new Map();
      
      // Initialize all 12 months
      for (let month = 0; month < 12; month++) {
        yearData.set(month, new Map());
      }
      
      filteredMembers.forEach((member: any) => {
        if (member.next_debit_date) {
          const debitDate = new Date(member.next_debit_date);
          if (debitDate.getFullYear() === currentYear) {
            const month = debitDate.getMonth();
            const day = debitDate.getDate();
            
            if (!yearData.get(month).has(day)) {
              yearData.get(month).set(day, []);
            }
            yearData.get(month).get(day).push(member);
          }
        }
      });
      
      setCalendarData({
        year: currentYear,
        yearData: yearData,
        allMembers: allMembers,
      });
      setShowCalendar(true);
    } catch (error) {
      console.error('Error fetching daily batches:', error);
    }
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' ? currentYear - 1 : currentYear + 1;
    setCurrentYear(newYear);
    
    // Recalculate calendar data for new year
    if (calendarData && calendarData.allMembers) {
      const yearData = new Map();
      
      // Initialize all 12 months
      for (let month = 0; month < 12; month++) {
        yearData.set(month, new Map());
      }
      
      // Filter members by group if specified
      const filteredMembers = calendarGroupFilter 
        ? calendarData.allMembers.filter((m: any) => m.broker_group === calendarGroupFilter)
        : calendarData.allMembers;
      
      filteredMembers.forEach((member: any) => {
        if (member.next_debit_date) {
          const debitDate = new Date(member.next_debit_date);
          if (debitDate.getFullYear() === newYear) {
            const month = debitDate.getMonth();
            const day = debitDate.getDate();
            
            if (!yearData.get(month).has(day)) {
              yearData.get(month).set(day, []);
            }
            yearData.get(month).get(day).push(member);
          }
        }
      });
      
      setCalendarData({
        ...calendarData,
        year: newYear,
        yearData: yearData,
      });
    }
  };

  const handleCalendarGroupChange = (groupName: string) => {
    setCalendarGroupFilter(groupName);
    
    // Recalculate calendar data with new group filter
    if (calendarData && calendarData.allMembers) {
      const yearData = new Map();
      
      // Initialize all 12 months
      for (let month = 0; month < 12; month++) {
        yearData.set(month, new Map());
      }
      
      // Filter members by group if specified
      const filteredMembers = groupName 
        ? calendarData.allMembers.filter((m: any) => m.broker_group === groupName)
        : calendarData.allMembers;
      
      filteredMembers.forEach((member: any) => {
        if (member.next_debit_date) {
          const debitDate = new Date(member.next_debit_date);
          if (debitDate.getFullYear() === calendarData.year) {
            const month = debitDate.getMonth();
            const day = debitDate.getDate();
            
            if (!yearData.get(month).has(day)) {
              yearData.get(month).set(day, []);
            }
            yearData.get(month).get(day).push(member);
          }
        }
      });
      
      setCalendarData({
        ...calendarData,
        yearData: yearData,
      });
    }
  };

  const handleDateClick = (year: number, month: number, day: number, members: any[]) => {
    if (members.length > 0) {
      const date = new Date(year, month, day);
      setSelectedDate({ date, members });
    }
  };

  const handleTodayClick = () => {
    if (calendarData) {
      const today = new Date();
      const todayMonth = today.getMonth();
      const todayDay = today.getDate();
      const todayYear = today.getFullYear();
      
      // Check if we're viewing the current year
      if (calendarData.year === todayYear) {
        const monthData = calendarData.yearData.get(todayMonth);
        const todayMembers = monthData?.get(todayDay) || [];
        
        if (todayMembers.length > 0) {
          setSelectedDate({ date: today, members: todayMembers });
        } else {
          alert('No debit orders scheduled for today');
        }
      } else {
        alert(`Please navigate to ${todayYear} to view today's batch`);
      }
    }
  };

  const handleCurrentMonthClick = () => {
    if (calendarData) {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Check if we're viewing the current year
      if (calendarData.year === currentYear) {
        const monthData = calendarData.yearData.get(currentMonth);
        
        // Collect all members for the current month
        const allMonthMembers: any[] = [];
        const dayBreakdown: { day: number; count: number; members: any[] }[] = [];
        
        if (monthData) {
          monthData.forEach((members: any[], day: number) => {
            if (members.length > 0) {
              allMonthMembers.push(...members);
              dayBreakdown.push({ day, count: members.length, members });
            }
          });
        }
        
        if (allMonthMembers.length > 0) {
          // Sort day breakdown by day
          dayBreakdown.sort((a, b) => a.day - b.day);
          
          setMonthSummaryData({
            month: currentMonth,
            year: currentYear,
            members: allMonthMembers,
            dayBreakdown: dayBreakdown,
          });
          setShowMonthSummary(true);
        } else {
          alert('No debit orders scheduled for the current month');
        }
      } else {
        alert(`Please navigate to ${currentYear} to view the current month`);
      }
    }
  };

  // Ensure groups is always an array
  const safeGroups = Array.isArray(groups) ? groups : [];

  // Calendar helper functions
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6">
      {/* Month Summary Modal */}
      {showMonthSummary && monthSummaryData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" onClick={() => setShowMonthSummary(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  📅 {monthNames[monthSummaryData.month]} {monthSummaryData.year} - Monthly Summary
                </h2>
                <p className="text-gray-600 mt-1">
                  {monthSummaryData.members.length} total debit orders across {monthSummaryData.dayBreakdown.length} days
                </p>
              </div>
              <button 
                onClick={() => setShowMonthSummary(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-blue-600">{monthSummaryData.members.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Premium</p>
                <p className="text-2xl font-bold text-green-600">
                  R{monthSummaryData.members.reduce((sum: number, m: any) => sum + (m.monthly_premium || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Arrears</p>
                <p className="text-2xl font-bold text-orange-600">
                  R{monthSummaryData.members.reduce((sum: number, m: any) => sum + (m.total_arrears || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Active Status</p>
                <p className="text-2xl font-bold text-purple-600">
                  {monthSummaryData.members.filter((m: any) => m.debit_order_status === 'active').length}
                </p>
              </div>
            </div>

            {/* Day Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Daily Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {monthSummaryData.dayBreakdown.map((dayData: any) => (
                  <button
                    key={dayData.day}
                    onClick={() => {
                      const date = new Date(monthSummaryData.year, monthSummaryData.month, dayData.day);
                      setSelectedDate({ date, members: dayData.members });
                      setShowMonthSummary(false);
                    }}
                    className="border rounded-lg p-3 hover:bg-blue-50 hover:border-blue-500 transition-all cursor-pointer"
                  >
                    <div className="text-2xl font-bold text-gray-700">{dayData.day}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(monthSummaryData.year, monthSummaryData.month, dayData.day).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                      {dayData.count} orders
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b">
                <h3 className="font-semibold text-gray-700">All Members This Month</h3>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Debit Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {monthSummaryData.members.map((member: any) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.member_number}</div>
                            <div className="text-sm text-gray-500">{member.first_name} {member.last_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.broker_group}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.next_debit_date ? new Date(member.next_debit_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          R{member.monthly_premium?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            member.debit_order_status === 'active' ? 'bg-green-100 text-green-800' :
                            member.debit_order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            member.debit_order_status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {member.debit_order_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowMonthSummary(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Export to CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" onClick={() => setSelectedDate(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  📅 Debit Orders for {selectedDate.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedDate.members.length} member{selectedDate.members.length !== 1 ? 's' : ''} scheduled
                </p>
              </div>
              <button 
                onClick={() => setSelectedDate(null)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-blue-600">{selectedDate.members.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Premium</p>
                <p className="text-2xl font-bold text-green-600">
                  R{selectedDate.members.reduce((sum, m) => sum + (m.monthly_premium || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Arrears</p>
                <p className="text-2xl font-bold text-orange-600">
                  R{selectedDate.members.reduce((sum, m) => sum + (m.total_arrears || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Active Status</p>
                <p className="text-2xl font-bold text-purple-600">
                  {selectedDate.members.filter(m => m.debit_order_status === 'active').length}
                </p>
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrears</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank Account</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedDate.members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.member_number}</div>
                            <div className="text-sm text-gray-500">{member.first_name} {member.last_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.broker_group}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          R{member.monthly_premium?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">
                          R{member.total_arrears?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            member.debit_order_status === 'active' ? 'bg-green-100 text-green-800' :
                            member.debit_order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            member.debit_order_status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {member.debit_order_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.bank_account_number ? `****${member.bank_account_number.slice(-4)}` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedDate(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Export to CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendar && calendarData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCalendar(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-7xl w-full max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateYear('prev')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  title="Previous year"
                >
                  ← {calendarData.year - 1}
                </button>
                <h2 className="text-2xl font-bold">
                  📅 Debit Order Calendar {calendarData.year}
                </h2>
                <button
                  onClick={() => navigateYear('next')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  title="Next year"
                >
                  {calendarData.year + 1} →
                </button>
                <div className="ml-4 border-l pl-4">
                  <select
                    value={calendarGroupFilter}
                    onChange={(e) => handleCalendarGroupChange(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  >
                    <option value="">All Groups</option>
                    {safeGroups.map((group) => (
                      <option key={group.broker_group} value={group.broker_group}>
                        {group.broker_group} ({group.member_count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button 
                onClick={() => setShowCalendar(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            
            {/* 12 Month Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, monthIndex) => {
                const monthData = calendarData.yearData.get(monthIndex);
                const today = new Date();
                const isCurrentMonth = monthIndex === today.getMonth() && calendarData.year === today.getFullYear();
                
                return (
                  <div key={monthIndex} className={`border rounded-lg p-4 ${isCurrentMonth ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <h3 className={`text-center font-bold mb-3 ${isCurrentMonth ? 'text-blue-600' : 'text-gray-700'}`}>
                      {monthNames[monthIndex]}
                    </h3>
                    
                    <div className="grid grid-cols-7 gap-1">
                      {/* Day headers */}
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-[10px] font-semibold text-gray-500">
                          {day}
                        </div>
                      ))}
                      
                      {/* Empty cells for days before month starts */}
                      {Array.from({ length: getFirstDayOfMonth(monthIndex, calendarData.year) }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square"></div>
                      ))}
                      
                      {/* Calendar days */}
                      {Array.from({ length: getDaysInMonth(monthIndex, calendarData.year) }).map((_, i) => {
                        const day = i + 1;
                        const membersOnDay = monthData?.get(day) || [];
                        const count = membersOnDay.length;
                        const isToday = day === today.getDate() && 
                                       monthIndex === today.getMonth() && 
                                       calendarData.year === today.getFullYear();
                        
                        return (
                          <div 
                            key={day}
                            onClick={() => handleDateClick(calendarData.year, monthIndex, day, membersOnDay)}
                            className={`aspect-square border rounded flex flex-col items-center justify-center text-[10px] transition-all ${
                              isToday ? 'border-blue-600 bg-blue-100 font-bold' : 'border-gray-200'
                            } ${count > 0 ? 'bg-green-50 cursor-pointer hover:bg-green-200 hover:shadow-md' : 'hover:bg-gray-50'}`}
                            title={count > 0 ? `${count} debit orders scheduled - Click to view details` : 'No debit orders'}
                          >
                            <div className={isToday ? 'text-blue-600 font-bold' : 'text-gray-700'}>
                              {day}
                            </div>
                            {count > 0 && (
                              <div className="text-[8px] font-bold text-green-700">
                                {count}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Summary Footer */}
            <div className="mt-6 pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-50 border border-gray-200 rounded"></div>
                  <span className="text-gray-600">Scheduled Orders</span>
                </div>
                <button
                  onClick={handleTodayClick}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Click to view today's batch"
                >
                  <div className="w-4 h-4 border-2 border-blue-600 bg-blue-100 rounded"></div>
                  <span className="text-gray-600 font-medium">Today</span>
                </button>
                <button
                  onClick={handleCurrentMonthClick}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Click to view current month summary"
                >
                  <div className="w-4 h-4 border-2 border-blue-500 bg-blue-50 rounded"></div>
                  <span className="text-gray-600 font-medium">Current Month</span>
                </button>
              </div>
              <div className="text-sm font-semibold text-gray-700">
                Total Orders in {calendarData.year}: {
                  Array.from(calendarData.yearData.values()).reduce((sum: number, monthMap: Map<number, any[]>) => {
                    return sum + Array.from(monthMap.values()).reduce((daySum: number, arr: any[]) => daySum + arr.length, 0);
                  }, 0)
                }
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">👤 Member Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search members..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.brokerGroup}
            onChange={(e) => setFilters({ ...filters, brokerGroup: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            size={1}
          >
            <option value="">All Groups</option>
            {safeGroups.map((group) => (
              <option key={group.broker_group} value={group.broker_group}>
                {group.broker_group} ({group.member_count} members)
              </option>
            ))}
          </select>
          <button
            onClick={() => handleDailyBatches(filters.brokerGroup)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
          >
            📅 Daily Batches
          </button>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No members found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrears</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Debit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{member.member_number}</div>
                        <div className="text-sm text-gray-500">{member.first_name} {member.last_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.broker_group}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R{member.monthly_premium?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">R{member.total_arrears?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        member.debit_order_status === 'active' ? 'bg-green-100 text-green-800' :
                        member.debit_order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        member.debit_order_status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.debit_order_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.next_debit_date ? new Date(member.next_debit_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Reports Tab Component
function ReportsTab({ summary }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">📈 Debit Order Reports</h2>
        
        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">📊 Collection Performance</h3>
            <p className="text-sm text-gray-600 mb-4">Success rates, failures, and trends by group</p>
            <button className="text-blue-600 hover:text-blue-800 font-medium">Generate Report →</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">💰 Financial Summary</h3>
            <p className="text-sm text-gray-600 mb-4">Premium collections and arrears analysis</p>
            <button className="text-blue-600 hover:text-blue-800 font-medium">Generate Report →</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">👥 Group Analysis</h3>
            <p className="text-sm text-gray-600 mb-4">Performance breakdown by broker group</p>
            <button className="text-blue-600 hover:text-blue-800 font-medium">Generate Report →</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">⚠️ Arrears Report</h3>
            <p className="text-sm text-gray-600 mb-4">Members with outstanding payments</p>
            <button className="text-blue-600 hover:text-blue-800 font-medium">Generate Report →</button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Quick Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {summary?.total && summary.total > 0 ? ((summary?.byStatus?.active?.count || 0) / summary.total * 100).toFixed(1) : '0'}%
              </p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">R{summary?.totalPremium?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-gray-600">Monthly Collection</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">R{summary?.totalArrears?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-gray-600">Total Arrears</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{summary?.total || 0}</p>
              <p className="text-sm text-gray-600">Active Members</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Batches Tab Component
function BatchesTab({ batches, router }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">📋 Batch History</h2>
        {batches.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No batches processed yet</p>
            <p className="text-sm mt-2">Batches will appear here after you run debit orders</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(batch.run_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {batch.batch_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {batch.batch_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {batch.total_members}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R{batch.total_amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          batch.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : batch.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => router.push(`/operations/debit-orders/${batch.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Refunds Tab Component - SEE NEXT MESSAGE FOR FULL IMPLEMENTATION

function RefundsTab() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({ status: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [createForm, setCreateForm] = useState({
    memberId: '',
    memberSearch: '',
    refundAmount: '',
    refundReason: '',
    notes: '',
  });
  const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRefunds();
    fetchStats();
  }, [filters]);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      params.append('limit', '50');

      const data = await apiClient.get(`/netcash/refunds?${params}`);
      setRefunds(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiClient.get('/netcash/refunds/stats/summary');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const searchMembers = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setMemberSearchResults([]);
      return;
    }

    try {
      const data = await apiClient.get(`/netcash/members?search=${searchTerm}&limit=10`);
      setMemberSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error searching members:', error);
      setMemberSearchResults([]);
    }
  };

  const handleCreateRefund = async () => {
    if (!createForm.memberId || !createForm.refundAmount || !createForm.refundReason) {
      alert('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    try {
      await apiClient.post('/netcash/refunds', {
        memberId: createForm.memberId,
        refundAmount: parseFloat(createForm.refundAmount),
        refundReason: createForm.refundReason,
        notes: createForm.notes,
      });

      alert('Refund request created successfully');
      setShowCreateModal(false);
      setCreateForm({
        memberId: '',
        memberSearch: '',
        refundAmount: '',
        refundReason: '',
        notes: '',
      });
      setMemberSearchResults([]);
      fetchRefunds();
      fetchStats();
    } catch (error: any) {
      console.error('Error creating refund:', error);
      alert(error.response?.data?.message || 'Failed to create refund request');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessRefund = async (refundId: string) => {
    if (!confirm('Are you sure you want to process this refund?')) return;

    setProcessing(true);
    try {
      await apiClient.post(`/netcash/refunds/${refundId}/process`);
      alert('Refund processed successfully');
      fetchRefunds();
      fetchStats();
      if (selectedRefund?.id === refundId) {
        setShowDetailsModal(false);
        setSelectedRefund(null);
      }
    } catch (error: any) {
      console.error('Error processing refund:', error);
      alert(error.response?.data?.message || 'Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelRefund = async (refundId: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    setProcessing(true);
    try {
      await apiClient.post(`/netcash/refunds/${refundId}/cancel`, { reason });
      alert('Refund cancelled successfully');
      fetchRefunds();
      fetchStats();
      if (selectedRefund?.id === refundId) {
        setShowDetailsModal(false);
        setSelectedRefund(null);
      }
    } catch (error: any) {
      console.error('Error cancelling refund:', error);
      alert(error.response?.data?.message || 'Failed to cancel refund');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewDetails = async (refundId: string) => {
    try {
      const data = await apiClient.get(`/netcash/refunds/${refundId}`);
      setSelectedRefund(data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching refund details:', error);
      alert('Failed to load refund details');
    }
  };

  const selectMember = (member: any) => {
    setCreateForm({
      ...createForm,
      memberId: member.id,
      memberSearch: `${member.member_number} - ${member.first_name} ${member.last_name}`,
    });
    setMemberSearchResults([]);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Refunds</p>
          <p className="text-2xl font-bold text-blue-600">{stats?.total || 0}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats?.byStatus?.pending || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Processing</p>
          <p className="text-2xl font-bold text-purple-600">{stats?.byStatus?.processing || 0}</p>
          <p className="text-xs text-gray-500 mt-1">In progress</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats?.byStatus?.completed || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Successfully processed</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats?.byStatus?.failed || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Requires attention</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">💸 Refund Management</h2>
            <p className="text-sm text-gray-600 mt-1">Process and track member refunds</p>
          </div>
          <div className="flex gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              + Create Refund
            </button>
          </div>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : refunds.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No refunds found</p>
            <p className="text-sm mt-2">Create a refund request to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {refunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(refund.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {refund.member?.member_number || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {refund.member?.first_name} {refund.member?.last_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      R{refund.refund_amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {refund.refund_reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          refund.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : refund.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : refund.status === 'processing'
                            ? 'bg-purple-100 text-purple-800'
                            : refund.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(refund.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </button>
                        {refund.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleProcessRefund(refund.id)}
                              disabled={processing}
                              className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                            >
                              Process
                            </button>
                            <button
                              onClick={() => handleCancelRefund(refund.id)}
                              disabled={processing}
                              className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Refund Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Refund Request</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Member Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Search by member number or name..."
                  value={createForm.memberSearch}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, memberSearch: e.target.value });
                    searchMembers(e.target.value);
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {memberSearchResults.length > 0 && (
                  <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                    {memberSearchResults.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => selectMember(member)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium">{member.member_number}</div>
                        <div className="text-sm text-gray-600">
                          {member.first_name} {member.last_name} - {member.broker_group}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Refund Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={createForm.refundAmount}
                  onChange={(e) => setCreateForm({ ...createForm, refundAmount: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Refund Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={createForm.refundReason}
                  onChange={(e) => setCreateForm({ ...createForm, refundReason: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a reason...</option>
                  <option value="overpayment">Overpayment</option>
                  <option value="duplicate_payment">Duplicate Payment</option>
                  <option value="policy_cancellation">Policy Cancellation</option>
                  <option value="incorrect_amount">Incorrect Amount</option>
                  <option value="customer_request">Customer Request</option>
                  <option value="system_error">System Error</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Additional notes or details..."
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRefund}
                disabled={processing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
              >
                {processing ? 'Creating...' : 'Create Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedRefund && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Refund Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-2 text-sm font-semibold rounded-full ${
                    selectedRefund.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : selectedRefund.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedRefund.status === 'processing'
                      ? 'bg-purple-100 text-purple-800'
                      : selectedRefund.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedRefund.status.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  Created {new Date(selectedRefund.created_at).toLocaleString()}
                </span>
              </div>

              {/* Member Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Member Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Member Number</p>
                    <p className="font-medium">{selectedRefund.member?.member_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">
                      {selectedRefund.member?.first_name} {selectedRefund.member?.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Broker Group</p>
                    <p className="font-medium">{selectedRefund.member?.broker_group || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Premium</p>
                    <p className="font-medium">
                      R{selectedRefund.member?.monthly_premium?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Refund Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Refund Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Refund Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      R{selectedRefund.refund_amount?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reason</p>
                    <p className="font-medium">{selectedRefund.refund_reason}</p>
                  </div>
                  {selectedRefund.netcash_refund_reference && (
                    <div>
                      <p className="text-sm text-gray-600">Netcash Reference</p>
                      <p className="font-medium font-mono text-sm">
                        {selectedRefund.netcash_refund_reference}
                      </p>
                    </div>
                  )}
                  {selectedRefund.processed_at && (
                    <div>
                      <p className="text-sm text-gray-600">Processed At</p>
                      <p className="font-medium">
                        {new Date(selectedRefund.processed_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedRefund.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRefund.notes}</p>
                </div>
              )}

              {/* Error Message */}
              {selectedRefund.error_message && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Error</h3>
                  <p className="text-red-700">{selectedRefund.error_message}</p>
                </div>
              )}

              {/* Audit Trail */}
              <div>
                <h3 className="font-semibold mb-2">Audit Trail</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created By:</span>
                    <span className="font-medium">{selectedRefund.created_by_user?.email || 'System'}</span>
                  </div>
                  {selectedRefund.processed_by_user && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processed By:</span>
                      <span className="font-medium">{selectedRefund.processed_by_user.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
              {selectedRefund.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleProcessRefund(selectedRefund.id)}
                    disabled={processing}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'Process Refund'}
                  </button>
                  <button
                    onClick={() => handleCancelRefund(selectedRefund.id)}
                    disabled={processing}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
                  >
                    Cancel Refund
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
