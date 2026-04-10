'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MemberProfile {
  member_number: string;
  first_name: string;
  last_name: string;
  id_number: string;
  date_of_birth: string;
  gender: string;
  email: string;
  mobile: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postal_code: string;
  plan_name: string;
  monthly_premium: number;
  status: string;
  broker_code: string;
}

export default function MemberProfilePage() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/member/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">View your personal information and policy details</p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Member Number</p>
                <p className="font-medium">{profile.member_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium">{profile.first_name} {profile.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ID Number</p>
                <p className="font-medium">{profile.id_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium">{new Date(profile.date_of_birth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium">{profile.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium capitalize">{profile.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mobile</p>
                <p className="font-medium">{profile.mobile}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">
                  {profile.address_line1}
                  {profile.address_line2 && `, ${profile.address_line2}`}
                  <br />
                  {profile.city}, {profile.postal_code}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Information */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-medium">{profile.plan_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Premium</p>
                <p className="font-medium">R{parseFloat(profile.monthly_premium?.toString() || '0').toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Broker Code</p>
                <p className="font-medium">{profile.broker_code || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
