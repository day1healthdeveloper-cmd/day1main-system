'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Member {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended' | 'cancelled' | 'in_waiting';
  brokerCode: string;
  brokerName: string;
  policyNumber: string;
  product: string;
  planId: string;
  paymentMethod: string;
  monthlyPremium: number;
  joinDate: string;
  riskScore: number;
  isDependant?: boolean;
  dependantType?: string;
  dependantCode?: number;
  dependants?: Member[];
}

interface FilterOptions {
  brokers: Array<{ code: string; name: string }>;
  plans: string[];
  paymentMethods: string[];
  statuses: string[];
}

export default function OperationsMembersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [brokerFilter, setBrokerFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    brokers: [],
    plans: [],
    paymentMethods: [],
    statuses: []
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
  });
  const [dataLoading, setDataLoading] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch stats on mount
  useEffect(() => {
    if (!statsLoaded) {
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/members?stats_only=true', {
        cache: 'no-store',
      });
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
        setStatsLoaded(true);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    // Restore search state from sessionStorage on mount
    const savedState = sessionStorage.getItem('memberSearchState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setSearchInput(state.searchTerm || '');
        setSearchTerm(state.searchTerm || '');
        setStatusFilter(state.statusFilter || '');
        setBrokerFilter(state.brokerFilter || '');
        setPlanFilter(state.planFilter || '');
        setPaymentMethodFilter(state.paymentMethodFilter || '');
      } catch (e) {
        console.error('Failed to restore search state:', e);
      }
    } else {
      // No saved state, set loading to false immediately
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    // Always fetch members when search term or filters change AND user has searched
    if (hasSearched) {
      fetchMembers();
    }
  }, [statusFilter, brokerFilter, planFilter, paymentMethodFilter, searchTerm, hasSearched]);

  const fetchMembers = async () => {
    try {
      console.log('fetchMembers called with searchTerm:', searchTerm);
      setDataLoading(true);
      
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== '') params.append('status', statusFilter);
      if (brokerFilter && brokerFilter !== '') params.append('broker', brokerFilter);
      if (planFilter && planFilter !== '') params.append('plan', planFilter);
      if (paymentMethodFilter && paymentMethodFilter !== '') params.append('payment_method', paymentMethodFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('include_dependants', 'true'); // Always include dependants
      
      console.log('API URL:', `/api/admin/members?${params.toString()}`);
      
      const response = await fetch(`/api/admin/members?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      console.log('API response:', data);
      console.log('Members count:', data.members?.length);
      setMembers(data.members || []);
      setTotalCount(data.count || 0);
      setStats(data.stats || stats);
      if (data.filters) {
        setFilterOptions(data.filters);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSearch = () => {
    console.log('handleSearch called, searchInput:', searchInput);
    setSearchTerm(searchInput);
    setHasSearched(true);
    // Store search state in sessionStorage
    sessionStorage.setItem('memberSearchState', JSON.stringify({
      searchTerm: searchInput,
      statusFilter,
      brokerFilter,
      planFilter,
      paymentMethodFilter
    }));
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusBadge = (status: Member['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
      in_waiting: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredMembers = members;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Members</h1>
            <p className="text-gray-600 mt-1">View and manage member records</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Pending Onboarding</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-3xl font-bold mt-1 text-orange-600">{stats.suspended}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search & Filter Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2 md:col-span-1">
                <label htmlFor="search" className="text-sm font-medium">Search</label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="Name, member number, email, ID number..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                  />
                  <div className="flex flex-col gap-1">
                    <Button onClick={handleSearch} className="whitespace-nowrap">
                      Search
                    </Button>
                    <Button 
                      onClick={() => {
                        setSearchInput('');
                        setSearchTerm('');
                      }} 
                      variant="outline" 
                      size="sm" 
                      className="whitespace-nowrap text-xs h-7"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="statusFilter" className="text-sm font-medium">Status</label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setHasSearched(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Click to select</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="in_waiting">In Waiting</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="brokerFilter" className="text-sm font-medium">Broker</label>
                <select
                  id="brokerFilter"
                  value={brokerFilter}
                  onChange={(e) => {
                    setBrokerFilter(e.target.value);
                    setHasSearched(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Click to select</option>
                  {filterOptions.brokers.map(broker => (
                    <option key={broker.code} value={broker.code}>
                      {broker.code} - {broker.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="planFilter" className="text-sm font-medium">Plan</label>
                <select
                  id="planFilter"
                  value={planFilter}
                  onChange={(e) => {
                    setPlanFilter(e.target.value);
                    setHasSearched(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Click to select</option>
                  {filterOptions.plans.map(plan => (
                    <option key={plan} value={plan}>{plan}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="paymentMethodFilter" className="text-sm font-medium">Payment Method</label>
                <select
                  id="paymentMethodFilter"
                  value={paymentMethodFilter}
                  onChange={(e) => {
                    setPaymentMethodFilter(e.target.value);
                    setHasSearched(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Click to select</option>
                  {filterOptions.paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Members List</CardTitle>
                <CardDescription>Showing {filteredMembers.length} of {totalCount} members</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push('/admin/data-import')}>
                  Bulk Upload
                </Button>
                <Button variant="outline" size="sm">Export to CSV</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Member Number</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Plan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Broker</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {dataLoading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                        <p className="text-gray-600 text-sm">Searching members...</p>
                      </td>
                    </tr>
                  ) : !hasSearched ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-lg font-medium mb-2">Search for members</p>
                        <p className="text-sm">Use the search box or filters above to find members</p>
                      </td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No members found matching your filters
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <>
                        <tr key={member.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <p className="font-mono text-sm font-medium">{member.memberNumber}</p>
                            <p className="text-xs text-gray-500">Inception: {new Date(member.joinDate).toLocaleDateString()}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium">{member.firstName} {member.lastName}</p>
                            <p className="text-xs text-gray-500">{member.idNumber}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{member.product || <span className="text-red-500">No Plan</span>}</p>
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(member.status)}</td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm" onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/operations/members/${member.id}`);
                            }}>
                              View
                            </Button>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{member.email}</p>
                            <p className="text-xs text-gray-500">{member.phone}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium">{member.brokerCode}</p>
                            <p className="text-xs text-gray-500">{member.brokerName}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium">R {member.monthlyPremium}</p>
                          </td>
                        </tr>
                        {member.dependants && member.dependants.length > 0 && member.dependants.map((dependant) => (
                          <tr key={dependant.id} className="border-b bg-blue-50/30 hover:bg-blue-50/50">
                            <td className="py-2 px-4 pl-8">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-600">↳</span>
                                <p className="font-mono text-xs text-gray-600">{dependant.memberNumber}-{dependant.dependantCode}</p>
                              </div>
                            </td>
                            <td className="py-2 px-4">
                              <p className="text-sm font-medium text-gray-700">{dependant.firstName} {dependant.lastName}</p>
                              <p className="text-xs text-blue-600">{dependant.dependantType}</p>
                            </td>
                            <td className="py-2 px-4">
                              <p className="text-xs text-gray-500">Covered under main</p>
                            </td>
                            <td className="py-2 px-4">{getStatusBadge(dependant.status)}</td>
                            <td className="py-2 px-4">
                              <Button variant="ghost" size="sm" className="text-xs">
                                View
                              </Button>
                            </td>
                            <td className="py-2 px-4">
                              <p className="text-xs text-gray-500">ID: {dependant.idNumber}</p>
                            </td>
                            <td className="py-2 px-4" colSpan={2}>
                              <p className="text-xs text-gray-400 italic">Dependant of main member</p>
                            </td>
                          </tr>
                        ))}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
