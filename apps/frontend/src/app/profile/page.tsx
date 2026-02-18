'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const dependants = [
    {
      id: 1,
      firstName: 'Jane',
      lastName: 'Doe',
      relationship: 'Spouse',
      idNumber: '8501015800084',
      dateOfBirth: '1 Jan 1985',
    },
    {
      id: 2,
      firstName: 'Tom',
      lastName: 'Doe',
      relationship: 'Child',
      idNumber: '1501015800085',
      dateOfBirth: '1 Jan 2015',
    },
  ];

  const consents = [
    {
      id: 1,
      type: 'Processing',
      description: 'Consent to process personal information',
      granted: true,
      grantedDate: '1 Jan 2024',
    },
    {
      id: 2,
      type: 'Marketing',
      description: 'Consent to receive marketing communications',
      granted: true,
      grantedDate: '1 Jan 2024',
    },
    {
      id: 3,
      type: 'Third Party Sharing',
      description: 'Consent to share information with healthcare providers',
      granted: true,
      grantedDate: '1 Jan 2024',
    },
  ];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic profile information</CardDescription>
              </div>
              <Button
                variant={isEditing ? 'outline' : 'default'}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </label>
                    <Input id="firstName" defaultValue={user.firstName} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </label>
                    <Input id="lastName" defaultValue={user.lastName} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input id="email" type="email" defaultValue={user.email} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <Input id="phone" type="tel" defaultValue="+27 82 123 4567" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="idNumber" className="text-sm font-medium">
                      ID Number
                    </label>
                    <Input id="idNumber" defaultValue="8001015800083" disabled />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dateOfBirth" className="text-sm font-medium">
                      Date of Birth
                    </label>
                    <Input id="dateOfBirth" type="date" defaultValue="1980-01-01" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium mt-1">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium mt-1">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium mt-1">+27 82 123 4567</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID Number</p>
                  <p className="font-medium mt-1">8001015800083</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium mt-1">1 January 1980</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium mt-1">1 January 2024</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Your addresses and contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium">Residential Address</p>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">123 Main Street</p>
                  <p className="text-sm">Sandton</p>
                  <p className="text-sm">Johannesburg, 2196</p>
                  <p className="text-sm">South Africa</p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium">Postal Address</p>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">Same as residential address</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dependants */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Dependants</CardTitle>
                <CardDescription>Manage your dependants on your policy</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                + Add Dependant
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dependants.map((dependant) => (
                <div
                  key={dependant.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {dependant.firstName[0]}{dependant.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{dependant.firstName} {dependant.lastName}</p>
                      <p className="text-sm text-gray-600">{dependant.relationship}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>ID: {dependant.idNumber}</span>
                        <span>•</span>
                        <span>DOB: {dependant.dateOfBirth}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Consents (POPIA) */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy & Consents</CardTitle>
            <CardDescription>Manage your data processing consents (POPIA)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consents.map((consent) => (
                <div
                  key={consent.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium">{consent.type}</p>
                      {consent.granted && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Granted
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{consent.description}</p>
                    {consent.granted && (
                      <p className="text-xs text-gray-500 mt-2">
                        Granted on {consent.grantedDate}
                      </p>
                    )}
                  </div>
                  <Button
                    variant={consent.granted ? 'outline' : 'default'}
                    size="sm"
                    className={consent.granted ? 'text-red-600 hover:text-red-700' : ''}
                  >
                    {consent.granted ? 'Revoke' : 'Grant'}
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-blue-900">About POPIA Compliance</p>
                  <p className="text-blue-700 mt-1">
                    We are committed to protecting your personal information in accordance with the Protection of Personal Information Act (POPIA). You can manage your consents at any time.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                </div>
                <Button variant="outline" size="sm">Change Password</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
