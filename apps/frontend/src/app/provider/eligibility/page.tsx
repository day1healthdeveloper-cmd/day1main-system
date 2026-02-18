'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function EligibilityCheckPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [memberNumber, setMemberNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    // Simulate API call
    setTimeout(() => {
      setSearchResult({
        member: {
          memberNumber: 'M-2024-5678',
          firstName: 'John',
          lastName: 'Smith',
          idNumber: '8001015800083',
          dateOfBirth: '1 Jan 1980',
          contactNumber: '+27 82 123 4567',
          email: 'john.smith@example.com',
        },
        policy: {
          policyNumber: 'POL-2024-001234',
          planName: 'Comprehensive Medical Plan',
          status: 'Active',
          startDate: '1 Jan 2024',
          renewalDate: '1 Jan 2025',
          premium: 2450,
        },
        coverage: {
          inNetwork: true,
          outOfNetwork: true,
          annualLimit: 500000,
          annualUsed: 45000,
          annualRemaining: 455000,
          waitingPeriods: {
            general: 'Completed',
            chronic: 'Completed',
            maternity: 'Not Applicable',
          },
        },
        benefits: [
          {
            category: 'General Practitioner',
            limit: 'Unlimited',
            used: 'R2,400',
            remaining: 'Unlimited',
            coPayment: 'None',
            preAuthRequired: false,
          },
          {
            category: 'Specialist Consultation',
            limit: 'R15,000 per year',
            used: 'R3,500',
            remaining: 'R11,500',
            coPayment: '10%',
            preAuthRequired: true,
          },
          {
            category: 'Hospital Admission',
            limit: 'R500,000 per year',
            used: 'R45,000',
            remaining: 'R455,000',
            coPayment: 'None',
            preAuthRequired: true,
          },
          {
            category: 'Pathology',
            limit: 'R8,000 per year',
            used: 'R1,200',
            remaining: 'R6,800',
            coPayment: 'None',
            preAuthRequired: false,
          },
          {
            category: 'Radiology',
            limit: 'R12,000 per year',
            used: 'R0',
            remaining: 'R12,000',
            coPayment: '10%',
            preAuthRequired: true,
          },
        ],
        dependants: [
          {
            name: 'Jane Smith',
            relationship: 'Spouse',
            idNumber: '8501015800084',
            status: 'Active',
          },
          {
            name: 'Tom Smith',
            relationship: 'Child',
            idNumber: '1501015800085',
            status: 'Active',
          },
        ],
      });
      setIsSearching(false);
    }, 1000);
  };

  const handleClear = () => {
    setMemberNumber('');
    setIdNumber('');
    setSearchResult(null);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Eligibility Check</h1>
          <p className="text-gray-600 mt-1">
            Verify patient coverage and benefit details in real-time
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Lookup</CardTitle>
            <CardDescription>
              Search by member number or ID number to verify eligibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="memberNumber" className="text-sm font-medium">
                    Member Number
                  </label>
                  <Input
                    id="memberNumber"
                    placeholder="M-2024-5678"
                    value={memberNumber}
                    onChange={(e) => setMemberNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="idNumber" className="text-sm font-medium">
                    ID Number
                  </label>
                  <Input
                    id="idNumber"
                    placeholder="8001015800083"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Check Eligibility'}
                </Button>
                {searchResult && (
                  <Button type="button" variant="outline" onClick={handleClear}>
                    Clear Results
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResult && (
          <>
            {/* Member Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Member Information</CardTitle>
                    <CardDescription>Patient details and contact information</CardDescription>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Eligible
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium mt-1">
                      {searchResult.member.firstName} {searchResult.member.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Number</p>
                    <p className="font-medium mt-1 font-mono">
                      {searchResult.member.memberNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ID Number</p>
                    <p className="font-medium mt-1">{searchResult.member.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium mt-1">{searchResult.member.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium mt-1">{searchResult.member.contactNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium mt-1">{searchResult.member.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policy Information */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Information</CardTitle>
                <CardDescription>Active policy and plan details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Policy Number</p>
                    <p className="font-medium mt-1 font-mono">
                      {searchResult.policy.policyNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Plan Name</p>
                    <p className="font-medium mt-1">{searchResult.policy.planName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                      {searchResult.policy.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium mt-1">{searchResult.policy.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Renewal Date</p>
                    <p className="font-medium mt-1">{searchResult.policy.renewalDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Premium</p>
                    <p className="font-medium mt-1">
                      R{searchResult.policy.premium.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coverage Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Coverage Summary</CardTitle>
                <CardDescription>Annual limits and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Annual Limit</p>
                      <p className="text-2xl font-bold mt-1">
                        R{searchResult.coverage.annualLimit.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Used This Year</p>
                      <p className="text-2xl font-bold mt-1 text-orange-600">
                        R{searchResult.coverage.annualUsed.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Remaining</p>
                      <p className="text-2xl font-bold mt-1 text-green-600">
                        R{searchResult.coverage.annualRemaining.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Annual Usage</span>
                      <span className="font-medium">
                        {((searchResult.coverage.annualUsed / searchResult.coverage.annualLimit) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(searchResult.coverage.annualUsed / searchResult.coverage.annualLimit) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Network Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium text-green-900">In-Network Coverage</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">Full benefits apply</p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-blue-900">Out-of-Network</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">Reduced benefits (70%)</p>
                    </div>
                  </div>

                  {/* Waiting Periods */}
                  <div>
                    <p className="font-medium text-gray-900 mb-3">Waiting Periods</p>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(searchResult.coverage.waitingPeriods).map(([key, value]) => (
                        <div key={key} className="p-3 border rounded-lg">
                          <p className="text-sm text-gray-600 capitalize">{key}</p>
                          <p className="font-medium mt-1">{value as string}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefit Details */}
            <Card>
              <CardHeader>
                <CardTitle>Benefit Details</CardTitle>
                <CardDescription>Coverage limits and requirements by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Annual Limit</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Used</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Remaining</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Co-Payment</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Pre-Auth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResult.benefits.map((benefit: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{benefit.category}</td>
                          <td className="py-3 px-4">{benefit.limit}</td>
                          <td className="py-3 px-4 text-orange-600">{benefit.used}</td>
                          <td className="py-3 px-4 text-green-600">{benefit.remaining}</td>
                          <td className="py-3 px-4">{benefit.coPayment}</td>
                          <td className="py-3 px-4">
                            {benefit.preAuthRequired ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Required
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Not Required
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Dependants */}
            <Card>
              <CardHeader>
                <CardTitle>Covered Dependants</CardTitle>
                <CardDescription>Family members on this policy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {searchResult.dependants.map((dependant: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {dependant.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{dependant.name}</p>
                          <p className="text-sm text-gray-600">{dependant.relationship}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">ID: {dependant.idNumber}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                          {dependant.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button>Submit Claim for This Patient</Button>
              <Button variant="outline">Request Pre-Authorization</Button>
              <Button variant="outline">Print Summary</Button>
            </div>
          </>
        )}

        {/* Information Card */}
        {!searchResult && (
          <Card>
            <CardHeader>
              <CardTitle>How to Use Eligibility Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  Use this tool to verify patient coverage before providing services. Real-time eligibility checks help prevent claim rejections.
                </p>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">What you'll see:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Member and policy information</li>
                    <li>Coverage limits and usage</li>
                    <li>Benefit details by category</li>
                    <li>Pre-authorization requirements</li>
                    <li>Co-payment information</li>
                    <li>Covered dependants</li>
                  </ul>
                </div>
                <p className="text-xs text-gray-500">
                  Note: Eligibility information is updated in real-time. Always verify before providing services.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarLayout>
  );
}
