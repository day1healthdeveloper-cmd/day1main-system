'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@supabase/supabase-js';

export default function NewProviderPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
    fax: '',
    email: '',
    prno: '',
    status: 'pending',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.provider_number) {
        setError('Provider name and number are required');
        setIsSubmitting(false);
        return;
      }

      const { data, error: insertError } = await supabase
        .from('providers')
        .insert([formData])
        .select();

      if (insertError) throw insertError;

      // Success - redirect back to providers list
      router.push('/admin/providers');
    } catch (err: any) {
      console.error('Error creating provider:', err);
      setError(err.message || 'Failed to create provider');
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

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Provider</h1>
            <p className="text-gray-600 mt-1">Register a new healthcare provider</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin/providers')}>
            Cancel
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Provider Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Provider Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="provider_number"
                    value={formData.provider_number}
                    onChange={handleChange}
                    placeholder="GP000001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Provider Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Dr. Smith"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Practice Name</label>
                  <Input
                    name="practice_name"
                    value={formData.practice_name}
                    onChange={handleChange}
                    placeholder="Smith Medical Centre"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="GP">GP</option>
                    <option value="Dentist">Dentist</option>
                    <option value="Specialist">Specialist</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Radiology">Radiology</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Profession</label>
                  <Input
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    placeholder="GP, Dentist, etc."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Practice Number (PRNO)</label>
                  <Input
                    name="prno"
                    value={formData.prno}
                    onChange={handleChange}
                    placeholder="573280"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      name="tel"
                      value={formData.tel}
                      onChange={handleChange}
                      placeholder="0123456789"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fax</label>
                    <Input
                      name="fax"
                      value={formData.fax}
                      onChange={handleChange}
                      placeholder="0123456789"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="provider@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Region</label>
                    <Input
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      placeholder="GAUTENG"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Suburb</label>
                    <Input
                      name="suburb"
                      value={formData.suburb}
                      onChange={handleChange}
                      placeholder="SANDTON"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Main Street, Building A"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="border-t pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Provider'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/providers')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </SidebarLayout>
  );
}
