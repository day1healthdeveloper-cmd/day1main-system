'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Provider {
  id: string;
  providerNumber: string;
  name: string;
  type: 'GP' | 'Specialist' | 'Hospital' | 'Pharmacy';
  practiceName: string;
  location: string;
  status: 'active' | 'pending' | 'suspended';
  contractStatus: 'active' | 'pending' | 'expired';
  registrationDate: string;
}

export default function AdminProvidersPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [providers] = useState<Provider[]>([
    { id: '1', providerNumber: 'PRV-001', name: 'Dr. Sarah Johnson', type: 'GP', practiceName: 'City Medical Centre', location: 'Cape Town', status: 'active', contractStatus: 'active', registrationDate: '2023-06-15' },
    { id: '2', providerNumber: 'PRV-002', name: 'Dr. Michael Brown', type: 'Specialist', practiceName: 'Heart Clinic', location: 'Johannesburg', status: 'pending', contractStatus: 'pending', registrationDate: '2024-01-11' },
  ]);

  // Disabled auth check for demo
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) router.push('/login');
  // }, [loading, isAuthenticated, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  const getStatusBadge = (status: string) => {
    const styles = { active: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', suspended: 'bg-red-100 text-red-800', expired: 'bg-gray-100 text-gray-800' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>{status.toUpperCase()}</span>;
  };

  const filteredProviders = providers.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.providerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provider Administration</h1>
            <p className="text-gray-600 mt-1">Manage provider directory and contracts</p>
          </div>
          <Button onClick={() => router.push('/admin/providers/new')}>+ Add Provider</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Total Providers</p><p className="text-3xl font-bold mt-1">{providers.length}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Active</p><p className="text-3xl font-bold mt-1 text-green-600">{providers.filter(p => p.status === 'active').length}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Pending Approval</p><p className="text-3xl font-bold mt-1 text-yellow-600">{providers.filter(p => p.status === 'pending').length}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-gray-600">Suspended</p><p className="text-3xl font-bold mt-1 text-red-600">{providers.filter(p => p.status === 'suspended').length}</p></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Search Providers</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input placeholder="Name, provider number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
          <CardHeader><CardTitle>Provider Directory</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Provider Number</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Practice</th>
                    <th className="text-left py-3 px-4 font-medium">Location</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.map((provider) => (
                    <tr key={provider.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{provider.providerNumber}</td>
                      <td className="py-3 px-4 font-medium">{provider.name}</td>
                      <td className="py-3 px-4">{provider.type}</td>
                      <td className="py-3 px-4">{provider.practiceName}</td>
                      <td className="py-3 px-4">{provider.location}</td>
                      <td className="py-3 px-4">{getStatusBadge(provider.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          {provider.status === 'pending' && <Button size="sm">Approve</Button>}
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
