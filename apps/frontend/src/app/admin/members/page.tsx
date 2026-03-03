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
  kycStatus: 'pending' | 'verified' | 'failed';
  riskScore: number;
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [brokerFilter, setBrokerFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
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
    kycPending: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [statusFilter, brokerFilter, planFilter, paymentMethodFilter]);

  const fetchMembers = async () => {
    try {
      setDataLoading(true);
      console.log('🔄 Fetching members from API...');
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (brokerFilter !== 'all') params.append('broker', brokerFilter);
      if (planFilter !== 'all') params.append('plan', planFilter);
      if (paymentMethodFilter !== 'all') params.append('payment_method', paymentMethodFilter);
      if (searchTerm) params.append('search', searchTerm);
      
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

  const handleSearch = () => {
    fetchMembers();
  };

  // Disabled auth check for demo
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [loading, isAuthenticated, router]);

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading members...</p>
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

  const getKycBadge = (kycStatus: Member['kycStatus']) => {
    const styles = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[kycStatus]}`}>
        {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
      </span>
    );
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.memberNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.idNumber.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesKyc = kycFilter === 'all' || member.kycStatus === kycFilter;
    return matchesSearch && matchesStatus && matchesKyc;
  });

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

        <Card>
          <CardHeader>
            <CardTitle>Search & Filter Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">Search</label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="Name, member number, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="sm">Search</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="statusFilter" className="text-sm font-medium">Status</label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Statuses</option>
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
                  onChange={(e) => setBrokerFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Brokers</option>
                  {filterOptions.brokers.map(broker => (
                    <option key={broker.code} value={broker.code}>
                      {broker.code} - {broker.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="planFilter" className="text-sm font-medium">Plan</label>
                <select
                  id="planFilter"
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Plans</option>
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
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Payment Methods</option>
                  {filterOptions.paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="kycFilter" className="text-sm font-medium">KYC Status</label>
                <select
                  id="kycFilter"
                  value={kycFilter}
                  onChange={(e) => setKycFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All KYC Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
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
                <CardDescription>Showing {filteredMembers.length} of {members.length} members</CardDescription>
              </div>
              <Button variant="outline" size="sm">Export to CSV</Button>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500">
                        No members found matching your filters
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-mono text-sm font-medium">{member.memberNumber}</p>
                          <p className="text-xs text-gray-500">Joined: {new Date(member.joinDate).toLocaleDateString()}</p>
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
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => {
                              setEditingMember(member);
                              setShowEditPlanModal(true);
                            }}>
                              {member.product ? 'Change' : 'Assign'}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => {
                              router.push(`/admin/members/${member.id}`);
                            }}>
                              View
                            </Button>
                          </div>
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
                    <p className="text-gray-600">KYC Status</p>
                    <div className="mt-1">{getKycBadge(selectedMember.kycStatus)}</div>
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
