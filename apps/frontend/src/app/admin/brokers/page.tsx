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
  brokerNumber: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'pending';
  activePolicies: number;
  monthlyCommission: number;
  registrationDate: string;
  fspNumber: string;
}

export default function AdminBrokersPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [brokers] = useState<Broker[]>([
    { id: '1', brokerNumber: 'BRK-001', name: 'John Broker', email: 'john@broker.com', phone: '0821234567', status: 'active', activePolicies: 156, monthlyCommission: 23400.0, registrationDate: '2023-01-15', fspNumber: 'FSP12345' },
    { id: '2', brokerNumber: 'BRK-002', name: 'Jane Agent', email: 'jane@agent.com', phone: '0827654321', status: 'active', activePolicies: 89, monthlyCommission: 13350.0, registrationDate: '2023-03-20', fspNumber: 'FSP67890' },
    { id: '3', brokerNumber: 'BRK-003', name: 'Bob Sales', email: 'bob@sales.com', phone: '0831112222', status: 'pending', activePolicies: 0, monthlyCommission: 0, registrationDate: '2024-01-11', fspNumber: 'FSP11111' },
  ]);

  // Disabled auth check for demo
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) router.push('/login');
  // }, [loading, isAuthenticated, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  const getStatusBadge = (status: Broker['status']) => {
    const styles = { active: 'bg-green-100 text-green-800', suspended: 'bg-red-100 text-red-800', pending: 'bg-yellow-100 text-yellow-800' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>{status.toUpperCase()}</span>;
  };

  const filteredBrokers = brokers.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.brokerNumber.toLowerCase().includes(searchTerm.toLowerCase()) || b.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: brokers.length,
    active: brokers.filter(b => b.status === 'active').length,
    totalPolicies: brokers.reduce((sum, b) => sum + b.activePolicies, 0),
    totalCommission: brokers.reduce((sum, b) => sum + b.monthlyCommission, 0),
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Broker Administration</h1>
            <p className="text-gray-600 mt-1">Manage broker directory and commissions</p>
          </div>
          <Button onClick={() => router.push('/admin/brokers/new')}>+ Add Broker</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Total Brokers</p><p className="text-3xl font-bold mt-1">{stats.total}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Active</p><p className="text-3xl font-bold mt-1 text-green-600">{stats.active}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Total Policies</p><p className="text-3xl font-bold mt-1">{stats.totalPolicies}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Monthly Commission</p><p className="text-2xl font-bold mt-1 text-green-600">R{stats.totalCommission.toLocaleString()}</p></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Search Brokers</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input placeholder="Name, broker number, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="all">All Statuses</option>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Broker Number</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Contact</th>
                    <th className="text-left py-3 px-4 font-medium">FSP Number</th>
                    <th className="text-center py-3 px-4 font-medium">Policies</th>
                    <th className="text-right py-3 px-4 font-medium">Commission</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBrokers.map((broker) => (
                    <tr key={broker.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-mono text-sm">{broker.brokerNumber}</p>
                        <p className="text-xs text-gray-500">Joined: {new Date(broker.registrationDate).toLocaleDateString()}</p>
                      </td>
                      <td className="py-3 px-4 font-medium">{broker.name}</td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{broker.email}</p>
                        <p className="text-xs text-gray-500">{broker.phone}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{broker.fspNumber}</td>
                      <td className="py-3 px-4 text-center font-medium">{broker.activePolicies}</td>
                      <td className="py-3 px-4 text-right font-medium text-green-600">R{broker.monthlyCommission.toLocaleString()}</td>
                      <td className="py-3 px-4">{getStatusBadge(broker.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          {broker.status === 'pending' && <Button size="sm">Approve</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
