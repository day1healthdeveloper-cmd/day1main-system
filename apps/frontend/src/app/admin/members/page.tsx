'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditMemberPlanModal } from '@/components/admin/edit-member-plan-modal';

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

export default function AdminMembersPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Separate state for input field
  const [statusFilter, setStatusFilter] = useState('');
  const [brokerFilter, setBrokerFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
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
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [hasSearched, setHasSearched] = useState(false);

  // Sync top and bottom scrollbars
  useEffect(() => {
    const topScroll = document.querySelector('.overflow-x-auto.mb-2') as HTMLElement;
    const bottomScroll = document.getElementById('members-table-container');
    
    if (!topScroll || !bottomScroll) return;

    // Set the width of the top scrollbar to match the table width
    const syncWidth = () => {
      const tableWidth = bottomScroll.scrollWidth;
      const topScrollInner = topScroll.firstElementChild as HTMLElement;
      if (topScrollInner) {
        topScrollInner.style.width = `${tableWidth}px`;
      }
    };

    // Sync scroll positions
    const syncTopToBottom = () => {
      bottomScroll.scrollLeft = topScroll.scrollLeft;
    };

    const syncBottomToTop = () => {
      topScroll.scrollLeft = bottomScroll.scrollLeft;
    };

    topScroll.addEventListener('scroll', syncTopToBottom);
    bottomScroll.addEventListener('scroll', syncBottomToTop);
    
    // Initial width sync
    syncWidth();
    
    // Re-sync width when data changes
    const observer = new MutationObserver(syncWidth);
    observer.observe(bottomScroll, { childList: true, subtree: true });

    return () => {
      topScroll.removeEventListener('scroll', syncTopToBottom);
      bottomScroll.removeEventListener('scroll', syncBottomToTop);
      observer.disconnect();
    };
  }, [members]);

  // Fetch stats and filter options on mount
  useEffect(() => {
    fetchStats();
    fetchFilterOptions();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/members?stats_only=true', {
        cache: 'no-store',
      });
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/admin/members?filters_only=true', {
        cache: 'no-store',
      });
      const data = await response.json();
      if (data.filters) {
        setFilterOptions(data.filters);
      }
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  // Fetch members only when filters or search change AND user has searched
  useEffect(() => {
    if (hasSearched) {
      fetchMembers();
    }
  }, [statusFilter, brokerFilter, planFilter, paymentMethodFilter, searchTerm, hasSearched]);

  const fetchMembers = async () => {
    try {
      setDataLoading(true);
      console.log('🔄 Fetching members from API...');
      
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== '') params.append('status', statusFilter);
      if (brokerFilter && brokerFilter !== '') params.append('broker', brokerFilter);
      if (planFilter && planFilter !== '') params.append('plan', planFilter);
      if (paymentMethodFilter && paymentMethodFilter !== '') params.append('payment_method', paymentMethodFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('include_dependants', 'true');
      
      const response = await fetch(`/api/admin/members?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      console.log('✅ Members API response:', data);
      console.log('   Members count:', data.count);
      console.log('   Stats:', data.stats);
      setMembers(data.members || []);
      setStats(data.stats || stats);
      if (data.filters) {
        setFilterOptions(data.filters);
      }
    } catch (error) {
      console.error('❌ Failed to fetch members:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchInput('');
    setStatusFilter('');
    setBrokerFilter('');
    setPlanFilter('');
    setPaymentMethodFilter('');
    setCurrentPage(1);
    setHasSearched(false);
    setMembers([]);
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
    setHasSearched(true);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleExportCSV = () => {
    const csvData = filteredMembers.map(member => ({
      'Member Number': member.memberNumber,
      'First Name': member.firstName,
      'Last Name': member.lastName,
      'ID Number': member.idNumber,
      'Email': member.email,
      'Phone': member.phone,
      'Status': member.status,
      'Plan': member.product,
      'Monthly Premium': member.monthlyPremium,
      'Broker Code': member.brokerCode,
      'Broker Name': member.brokerName,
      'Payment Method': member.paymentMethod,
      'Join Date': new Date(member.joinDate).toLocaleDateString(),
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleSelectMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMembers.length === paginatedMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(paginatedMembers.map(m => m.id));
    }
  };

  // Disabled auth check for demo
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Member Administration</h1>
            <p className="text-gray-600 mt-1">Search and manage member records</p>
          </div>
          <Button onClick={() => router.push('/admin/members/new')}>+ Add Member</Button>
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

        {selectedMembers.length > 0 && (
          <Card className="border-blue-500 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Bulk Update Status</Button>
                  <Button size="sm" variant="outline">Bulk Assign Plan</Button>
                  <Button size="sm" variant="outline">Send Bulk Email</Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedMembers([])}>Clear Selection</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                  <Button onClick={handleSearch} className="whitespace-nowrap">
                    Search
                  </Button>
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
            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Members List</CardTitle>
                <CardDescription>
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredMembers.length)} of {filteredMembers.length} members
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push('/admin/data-import')}>
                  Bulk Upload
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={filteredMembers.length === 0}>
                  Export to CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Top scrollbar */}
            <div className="overflow-x-auto mb-2" style={{ overflowY: 'hidden', height: '20px' }}>
              <div style={{ height: '1px', width: 'fit-content', minWidth: '100%' }}></div>
            </div>
            
            {/* Main table with bottom scrollbar */}
            <div className="overflow-x-auto" id="members-table-container">
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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {dataLoading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                        <p className="text-gray-600 text-sm">Searching members...</p>
                      </td>
                    </tr>
                  ) : !hasSearched ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-lg font-medium mb-2">Search for members</p>
                        <p className="text-sm">Use the search box or filters above to find members</p>
                      </td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500">
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
                            <Button variant="outline" size="sm" onClick={() => {
                              router.push(`/admin/members/${member.id}`);
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
                          <td className="py-3 px-4">
                            <p className="text-xs">{member.paymentMethod}</p>
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
                            <td className="py-2 px-4" colSpan={3}>
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

        {showMemberDetails && selectedMember && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Member Details</CardTitle>
                  <CardDescription>{selectedMember.memberNumber}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowMemberDetails(false)}>Close</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Full Name</p>
                    <p className="font-medium">{selectedMember.firstName} {selectedMember.lastName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">ID Number</p>
                    <p className="font-medium">{selectedMember.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{selectedMember.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium">{selectedMember.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Broker</p>
                    <p className="font-medium">{selectedMember.brokerCode} - {selectedMember.brokerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Plan</p>
                    <p className="font-medium">{selectedMember.product}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly Premium</p>
                    <p className="font-medium">R {selectedMember.monthlyPremium}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-medium">{selectedMember.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedMember.status)}</div>
                  </div>
                  <div>
                    <p className="text-gray-600">Join Date</p>
                    <p className="font-medium">{new Date(selectedMember.joinDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Member Number</p>
                    <p className="font-medium font-mono">{selectedMember.memberNumber}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button size="sm">Edit Member</Button>
                  <Button size="sm" variant="outline">View Policy</Button>
                  <Button size="sm" variant="outline">View Claims</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {editingMember && (
        <EditMemberPlanModal
          member={editingMember}
          isOpen={showEditPlanModal}
          onClose={() => {
            setShowEditPlanModal(false);
            setEditingMember(null);
          }}
          onSave={() => {
            fetchMembers(); // Refresh the list
          }}
        />
      )}
    </SidebarLayout>
  );
}
