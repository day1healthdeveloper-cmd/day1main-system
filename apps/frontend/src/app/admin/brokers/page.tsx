'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Broker {
  id: string;
  code: string;
  name: string;
  broker_commission_rate: number;
  branch_commission_rate: number;
  agent_commission_rate: number;
  policy_prefix: string;
  status: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export default function AdminBrokersPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loadingBrokers, setLoadingBrokers] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    broker_commission_rate: '5.00',
    branch_commission_rate: '2.00',
    agent_commission_rate: '1.00',
    policy_prefix: '',
    status: 'active',
  });

  useEffect(() => {
    fetchBrokers();
  }, []);

  const fetchBrokers = async () => {
    try {
      console.log('Fetching brokers...');
      const response = await fetch('/api/admin/brokers');
      const data = await response.json();
      console.log('Brokers response:', data);
      setBrokers(data.brokers || []);
    } catch (error) {
      console.error('Error fetching brokers:', error);
    } finally {
      setLoadingBrokers(false);
    }
  };

  const handleAddBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingBroker 
        ? `/api/admin/brokers/${editingBroker.id}`
        : '/api/admin/brokers';
      
      const method = editingBroker ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(editingBroker ? '✅ Broker updated successfully!' : '✅ Broker added successfully!');
        setShowAddForm(false);
        setEditingBroker(null);
        setFormData({
          code: '',
          name: '',
          broker_commission_rate: '5.00',
          branch_commission_rate: '2.00',
          agent_commission_rate: '1.00',
          policy_prefix: '',
          status: 'active',
        });
        fetchBrokers();
      } else {
        if (data.error?.includes('duplicate key') || data.error?.includes('unique constraint')) {
          alert('❌ Error: A broker with this code already exists. Please use a different code.');
        } else {
          alert('❌ Error: ' + (data.error || 'Failed to save broker'));
        }
      }
    } catch (error) {
      console.error('Error saving broker:', error);
      alert('❌ Failed to save broker. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditBroker = (broker: Broker) => {
    console.log('Edit broker clicked:', broker);
    setEditingBroker(broker);
    setFormData({
      code: broker.code,
      name: broker.name,
      broker_commission_rate: broker.broker_commission_rate.toString(),
      branch_commission_rate: broker.branch_commission_rate.toString(),
      agent_commission_rate: broker.agent_commission_rate.toString(),
      policy_prefix: broker.policy_prefix,
      status: broker.status,
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteBroker = async (broker: Broker) => {
    if (!confirm(`Are you sure you want to delete ${broker.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/brokers/${broker.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('✅ Broker deleted successfully!');
        fetchBrokers();
      } else {
        const data = await response.json();
        alert('❌ Error: ' + (data.error || 'Failed to delete broker'));
      }
    } catch (error) {
      console.error('Error deleting broker:', error);
      alert('❌ Failed to delete broker. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setShowAddForm(false);
    setEditingBroker(null);
    setFormData({
      code: '',
      name: '',
      broker_commission_rate: '5.00',
      branch_commission_rate: '2.00',
      agent_commission_rate: '1.00',
      policy_prefix: '',
      status: 'active',
    });
  };

  // Disabled auth check for demo
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) router.push('/login');
  // }, [loading, isAuthenticated, router]);

  if (loading || !user || loadingBrokers) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = { 
      active: 'bg-green-100 text-green-800', 
      suspended: 'bg-red-100 text-red-800', 
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.inactive}`}>{status.toUpperCase()}</span>;
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredBrokers = brokers.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (b.code && b.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: brokers.length,
    active: brokers.filter(b => b.status === 'active').length,
    totalPolicies: brokers.reduce((sum, b) => sum + (b.member_count || 0), 0),
    totalCommission: brokers.reduce((sum, b) => sum + (b.member_count || 0) * 150, 0), // Estimate
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Broker Administration</h1>
            <p className="text-gray-600 mt-1">Manage broker directory and commissions</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Cancel' : '+ Add Broker'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Total Brokers</p><p className="text-3xl font-bold mt-1">{stats.total}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Active</p><p className="text-3xl font-bold mt-1 text-green-600">{stats.active}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Total Members</p><p className="text-3xl font-bold mt-1">{stats.totalPolicies}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Est. Commission</p><p className="text-2xl font-bold mt-1 text-green-600">R{stats.totalCommission.toLocaleString()}</p></div></CardContent></Card>
        </div>

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingBroker ? 'Edit Broker' : 'Add New Broker'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddBroker} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Broker Code *</label>
                    <Input
                      placeholder="e.g., D1ABC"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      disabled={!!editingBroker}
                      required
                    />
                    {editingBroker && <p className="text-xs text-gray-500">Code cannot be changed</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Broker Name *</label>
                    <Input
                      placeholder="e.g., ABC Insurance Brokers"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Policy Prefix *</label>
                    <Input
                      placeholder="e.g., ABC"
                      value={formData.policy_prefix}
                      onChange={(e) => setFormData({ ...formData, policy_prefix: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Broker Commission Rate (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.broker_commission_rate}
                      onChange={(e) => setFormData({ ...formData, broker_commission_rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Branch Commission Rate (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.branch_commission_rate}
                      onChange={(e) => setFormData({ ...formData, branch_commission_rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Agent Commission Rate (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.agent_commission_rate}
                      onChange={(e) => setFormData({ ...formData, agent_commission_rate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : editingBroker ? 'Update Broker' : 'Add Broker'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Search Brokers</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Name, broker number, email..." 
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
                <label className="text-sm font-medium">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Click to select</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Broker Directory</CardTitle></CardHeader>
          <CardContent>
            {loadingBrokers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading brokers...</p>
              </div>
            ) : filteredBrokers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No brokers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Code</th>
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Policy Prefix</th>
                      <th className="text-center py-3 px-4 font-medium">Members</th>
                      <th className="text-center py-3 px-4 font-medium">Broker %</th>
                      <th className="text-center py-3 px-4 font-medium">Branch %</th>
                      <th className="text-center py-3 px-4 font-medium">Agent %</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrokers.map((broker) => (
                      <tr key={broker.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm font-medium">{broker.code}</td>
                        <td className="py-3 px-4">{broker.name}</td>
                        <td className="py-3 px-4 font-mono text-sm">{broker.policy_prefix}</td>
                        <td className="py-3 px-4 text-center font-medium">{broker.member_count || 0}</td>
                        <td className="py-3 px-4 text-center">{broker.broker_commission_rate}%</td>
                        <td className="py-3 px-4 text-center">{broker.branch_commission_rate}%</td>
                        <td className="py-3 px-4 text-center">{broker.agent_commission_rate}%</td>
                        <td className="py-3 px-4">{getStatusBadge(broker.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditBroker(broker)}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteBroker(broker)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
