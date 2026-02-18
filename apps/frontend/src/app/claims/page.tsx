'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ClaimsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [showSubmitForm, setShowSubmitForm] = useState(false);

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

  const claims = [
    {
      id: 'CLM-20260115-001',
      type: 'General Consultation',
      provider: 'Dr. Smith',
      date: '15 Jan 2026',
      amount: 850,
      status: 'pending',
      statusText: 'Under Review',
    },
    {
      id: 'CLM-20260110-002',
      type: 'Prescription Medication',
      provider: 'Dis-Chem Pharmacy',
      date: '10 Jan 2026',
      amount: 320,
      status: 'approved',
      statusText: 'Approved',
      approvedAmount: 320,
    },
    {
      id: 'CLM-20260105-003',
      type: 'Blood Test',
      provider: 'PathCare',
      date: '5 Jan 2026',
      amount: 450,
      status: 'approved',
      statusText: 'Approved',
      approvedAmount: 450,
    },
    {
      id: 'CLM-20251220-004',
      type: 'Dental Cleaning',
      provider: 'Smile Dental',
      date: '20 Dec 2025',
      amount: 650,
      status: 'paid',
      statusText: 'Paid',
      approvedAmount: 650,
      paidDate: '28 Dec 2025',
    },
  ];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Claims</h1>
            <p className="text-gray-600 mt-1">
              Submit and track your medical claims
            </p>
          </div>
          <Button onClick={() => setShowSubmitForm(!showSubmitForm)}>
            {showSubmitForm ? 'View Claims' : 'Submit New Claim'}
          </Button>
        </div>

        {/* Submit Claim Form */}
        {showSubmitForm && (
          <Card>
            <CardHeader>
              <CardTitle>Submit New Claim</CardTitle>
              <CardDescription>Fill in the details of your medical expense</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="claimType" className="text-sm font-medium">
                      Claim Type
                    </label>
                    <select
                      id="claimType"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option>General Consultation</option>
                      <option>Specialist Consultation</option>
                      <option>Prescription Medication</option>
                      <option>Laboratory Tests</option>
                      <option>Radiology</option>
                      <option>Dental</option>
                      <option>Optical</option>
                      <option>Hospital</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="serviceDate" className="text-sm font-medium">
                      Service Date
                    </label>
                    <Input id="serviceDate" type="date" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="provider" className="text-sm font-medium">
                      Provider Name
                    </label>
                    <Input id="provider" placeholder="Dr. Smith" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium">
                      Amount (R)
                    </label>
                    <Input id="amount" type="number" placeholder="850.00" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="diagnosis" className="text-sm font-medium">
                      Diagnosis Code (ICD-10)
                    </label>
                    <Input id="diagnosis" placeholder="J00" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="procedure" className="text-sm font-medium">
                      Procedure Code
                    </label>
                    <Input id="procedure" placeholder="0001" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Any additional information..."
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="documents" className="text-sm font-medium">
                    Supporting Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Submit Claim
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSubmitForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Claims Summary */}
        {!showSubmitForm && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Claims</CardDescription>
                  <CardTitle className="text-2xl">4</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Pending</CardDescription>
                  <CardTitle className="text-2xl text-yellow-600">1</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Approved</CardDescription>
                  <CardTitle className="text-2xl text-green-600">2</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Paid</CardDescription>
                  <CardTitle className="text-2xl text-blue-600">1</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Claims List */}
            <Card>
              <CardHeader>
                <CardTitle>Claims History</CardTitle>
                <CardDescription>Track the status of your submitted claims</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-medium">{claim.type}</p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              claim.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : claim.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : claim.status === 'paid'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {claim.statusText}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="text-xs text-gray-500">Claim Number</p>
                            <p className="font-mono">{claim.id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Provider</p>
                            <p>{claim.provider}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Service Date</p>
                            <p>{claim.date}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="font-medium">R{claim.amount.toFixed(2)}</p>
                          </div>
                        </div>
                        {claim.approvedAmount && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600">Approved Amount: </span>
                            <span className="font-medium text-green-600">
                              R{claim.approvedAmount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {claim.paidDate && (
                          <div className="mt-1 text-sm text-gray-600">
                            Paid on {claim.paidDate}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
