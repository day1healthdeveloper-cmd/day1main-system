'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  user_id: string | null;
  login_email: string | null;
  login_password: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProviderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Partial<Provider>>({});

  useEffect(() => {
    if (params.id) {
      fetchProvider();
    }
  }, [params.id]);

  async function fetchProvider() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/providers/${params.id}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setProvider(data.provider);
      setFormData(data.provider);
    } catch (error: any) {
      console.error('Error fetching provider:', error);
      setError(error.message || 'Failed to load provider');
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');

      const response = await fetch(`/api/admin/providers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      await fetchProvider();
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating provider:', error);
      setError(error.message || 'Failed to update provider');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(provider || {});
    setIsEditing(false);
    setError('');
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError('');

      const response = await fetch(`/api/admin/providers/${params.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      router.push('/admin/providers');
    } catch (error: any) {
      console.error('Error deleting provider:', error);
      setError(error.message || 'Failed to delete provider');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error && !provider) {
    return (
      <SidebarLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Provider Not Found</h1>
            <Button variant="outline" onClick={() => router.push('/admin/providers')}>
              Back to Providers
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provider Details</h1>
            <p className="text-gray-600 mt-1">{provider?.provider_number}</p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={() => router.push('/admin/providers')}>
                  Back to List
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  Edit Provider
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Delete Provider
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Delete Provider</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Are you sure you want to delete <strong>{provider?.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Provider'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Provider Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Provider Information</CardTitle>
              {provider && getStatusBadge(provider.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Provider Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Provider Number</label>
                {isEditing ? (
                  <Input
                    name="provider_number"
                    value={formData.provider_number || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-gray-900 font-mono">{provider?.provider_number}</p>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                {isEditing ? (
                  <Input
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-gray-900">{provider?.name}</p>
                )}
              </div>

              {/* Profession */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Profession</label>
                {isEditing ? (
                  <Input
                    name="profession"
                    value={formData.profession || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-gray-900">{provider?.profession}</p>
                )}
              </div>

              {/* Practice Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Practice Name</label>
                {isEditing ? (
                  <Input
                    name="practice_name"
                    value={formData.practice_name || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-gray-900">{provider?.practice_name || '-'}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                {isEditing ? (
                  <Input
                    name="tel"
                    value={formData.tel || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-gray-900">{provider?.tel || '-'}</p>
                )}
              </div>

              {/* Fax */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Fax</label>
                {isEditing ? (
                  <Input
                    name="fax"
                    value={formData.fax || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-gray-900">{provider?.fax || '-'}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                {isEditing ? (
                  <Input
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-gray-900">{provider?.email || '-'}</p>
                )}
              </div>

              {/* Practice Number (PRNO) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Practice Number (PRNO)</label>
                {isEditing ? (
                  <Input
                    name="prno"
                    value={formData.prno || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-gray-900">{provider?.prno || '-'}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                ) : (
                  <p className="text-gray-900">{provider?.address || '-'}</p>
                )}
              </div>

              {/* Suburb */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Suburb</label>
                {isEditing ? (
                  <Input
                    name="suburb"
                    value={formData.suburb || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-gray-900">{provider?.suburb || '-'}</p>
                )}
              </div>

              {/* Region */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Region</label>
                {isEditing ? (
                  <Input
                    name="region"
                    value={formData.region || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-gray-900">{provider?.region || '-'}</p>
                )}
              </div>

              {/* Province */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Province</label>
                {isEditing ? (
                  <Input
                    name="disp_province"
                    value={formData.disp_province || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-gray-900">{provider?.disp_province || '-'}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                {isEditing ? (
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{provider?.status}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Credentials */}
        {provider && (
          <Card>
            <CardHeader>
              <CardTitle>Login Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Update login credentials for this provider</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Login Email</label>
                      <Input
                        name="login_email"
                        type="email"
                        value={formData.login_email || ''}
                        onChange={handleChange}
                        placeholder="provider@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Password</label>
                      <Input
                        name="login_password"
                        type="text"
                        value={formData.login_password || ''}
                        onChange={handleChange}
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Note: Changing credentials will update the user account</p>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Credentials'}
                    </Button>
                  </div>
                </div>
              ) : provider.login_email ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Login Email</p>
                    <p className="text-gray-900 font-mono">{provider.login_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Password</p>
                    <p className="text-gray-900 font-mono">{provider.login_password || '••••••••'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${provider.user_id ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {provider.user_id ? 'Active' : 'Not Created'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="text-gray-900 font-mono text-xs">{provider.user_id || '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">No login credentials configured</p>
                  <p className="text-sm text-gray-400">Provider cannot access the provider portal</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        {provider && (
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Created At</p>
                  <p className="text-gray-900">{new Date(provider.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="text-gray-900">{new Date(provider.updated_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Provider ID</p>
                  <p className="text-gray-900 font-mono text-xs">{provider.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarLayout>
  );
}
