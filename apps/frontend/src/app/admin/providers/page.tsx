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
  provider_number: string;
  name: string;
  type: string;
  practice_name: string;
  region: string;
  suburb: string;
  address: string;
  status: string;
  profession: string;
  tel: string;
  fax: string;
  prno: string;
  email: string;
  disp_province: string;
  is_active: boolean;
}

export default function AdminProvidersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    provider_number: '',
    name: '',
    practice_name: '',
    type: 'GP',
    profession: 'GP',
    region: '',
    suburb: '',
    address: '',
    tel: '',
    email: '',
    prno: '',
    status: 'active',
    // Login credentials
    login_email: '',
    login_password: '',
    first_name: '',
    last_name: '',
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  async function fetchProviders() {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/providers', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setProviders(data.providers || []);
      setStats(data.stats || stats);
      console.log(`✅ Loaded ${data.providers?.length} providers from API`);
    } catch (error: any) {
      console.error('❌ Error fetching providers:', error);
      setError(error.message || 'Failed to load providers');
    } finally {
      setIsLoading(false);
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!formData.name || !formData.provider_number) {
        setError('Provider name and number are required');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Reset form and refresh list
      setFormData({
        provider_number: '',
        name: '',
        practice_name: '',
        type: 'GP',
        profession: 'GP',
        region: '',
        suburb: '',
        address: '',
        tel: '',
        email: '',
        prno: '',
        status: 'active',
        login_email: '',
        login_password: '',
        first_name: '',
        last_name: '',
      });
      setShowAddForm(false);
      await fetchProviders();
    } catch (err: any) {
      console.error('Error creating provider:', err);
      setError(err.message || 'Failed to create provider');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = { 
      active: 'bg-green-100 text-green-800', 
      pending: 'bg-yellow-100 text-yellow-800', 
      suspended: 'bg-red-100 text-red-800', 
      inactive: 'bg-gray-100 text-gray-800' 
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredProviders = providers.filter((p) => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.provider_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.practice_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = stats.active;
  const pendingCount = stats.pending;
  const inactiveCount = stats.inactive;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provider Setup</h1>
            <p className="text-gray-600 mt-1">Manage healthcare provider directory</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Add Provider'}
          </Button>
        </div>

        {/* Add Provider Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Provider</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provider Number <span className="text-red-500">*</span></label>
                    <Input name="provider_number" value={formData.provider_number} onChange={handleFormChange} placeholder="GP000001" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provider Name <span className="text-red-500">*</span></label>
                    <Input name="name" value={formData.name} onChange={handleFormChange} placeholder="Dr. John Smith" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Practice Name</label>
                    <Input name="practice_name" value={formData.practice_name} onChange={handleFormChange} placeholder="Smith Medical Centre" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <select name="type" value={formData.type} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="GP">GP</option>
                      <option value="Dentist">Dentist</option>
                      <option value="Specialist">Specialist</option>
                      <option value="Hospital">Hospital</option>
                      <option value="Pharmacy">Pharmacy</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Profession</label>
                    <Input name="profession" value={formData.profession} onChange={handleFormChange} placeholder="GP" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Practice Number (PRNO)</label>
                    <Input name="prno" value={formData.prno} onChange={handleFormChange} placeholder="573280" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input name="tel" value={formData.tel} onChange={handleFormChange} placeholder="0123456789" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input name="email" type="email" value={formData.email} onChange={handleFormChange} placeholder="provider@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Region</label>
                    <Input name="region" value={formData.region} onChange={handleFormChange} placeholder="GAUTENG" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Suburb</label>
                    <Input name="suburb" value={formData.suburb} onChange={handleFormChange} placeholder="SANDTON" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input name="address" value={formData.address} onChange={handleFormChange} placeholder="123 Main Street" />
                  </div>
                </div>

                {/* Login Credentials Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Login Credentials (Optional)</h3>
                  <p className="text-sm text-gray-600 mb-4">Create a user account for this provider to access the provider portal</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input name="first_name" value={formData.first_name} onChange={handleFormChange} placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input name="last_name" value={formData.last_name} onChange={handleFormChange} placeholder="Smith" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Login Email</label>
                      <Input name="login_email" type="email" value={formData.login_email} onChange={handleFormChange} placeholder="provider@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <Input name="login_password" type="password" value={formData.login_password} onChange={handleFormChange} placeholder="Min 6 characters" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Provider'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Providers</p>
                <p className="text-3xl font-bold mt-1">{providers.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{activeCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-3xl font-bold mt-1 text-gray-600">{inactiveCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Name, provider number, practice..." 
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
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Click to select</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Directory Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Provider Directory</h2>
              <p className="text-sm text-gray-600">
                Showing {filteredProviders.length} of {providers.length} providers
              </p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading providers...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No providers found</p>
            </div>
          ) : (
            <>
              {/* TOP SCROLLBAR */}
              <div 
                className="overflow-x-scroll overflow-y-hidden bg-gray-100 border-b-2 border-blue-500"
                style={{ height: '20px' }}
                onScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  const tableScroll = document.getElementById('provider-table-scroll');
                  if (tableScroll) {
                    tableScroll.scrollLeft = target.scrollLeft;
                  }
                }}
              >
                <div style={{ width: '2000px', height: '1px' }}></div>
              </div>

              {/* TABLE */}
              <div 
                id="provider-table-scroll"
                style={{ 
                  overflowX: 'scroll',
                  overflowY: 'visible',
                  WebkitOverflowScrolling: 'touch'
                }}
                onScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  const topScroll = target.previousElementSibling as HTMLDivElement;
                  if (topScroll) {
                    topScroll.scrollLeft = target.scrollLeft;
                  }
                }}
              >
                <table style={{ width: '2000px', minWidth: '2000px' }}>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profession</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fax</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispense/Script</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Province</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suburb</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.1)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProviders.map((provider) => (
                      <tr key={provider.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{provider.provider_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{provider.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {provider.profession || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{provider.tel || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{provider.fax || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{provider.disp_province || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{provider.disp_province || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{provider.region || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{provider.suburb || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{provider.address || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(provider.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm sticky right-0 bg-white shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.1)]">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => router.push(`/admin/providers/${provider.id}`)}
                            >
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
