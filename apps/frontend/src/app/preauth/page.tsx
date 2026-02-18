'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PreAuthPage() {
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

  const preauths = [
    {
      id: 'PA-20260120-001',
      type: 'Hospital Admission',
      provider: 'Sandton Mediclinic',
      requestDate: '20 Jan 2026',
      procedureDate: '25 Jan 2026',
      estimatedAmount: 45000,
      approvedAmount: 45000,
      status: 'approved',
      statusText: 'Approved',
      expiryDate: '25 Feb 2026',
      conditions: 'Valid for 30 days from procedure date',
    },
    {
      id: 'PA-20260118-002',
      type: 'MRI Scan',
      provider: 'Radiology Associates',
      requestDate: '18 Jan 2026',
      procedureDate: '22 Jan 2026',
      estimatedAmount: 8500,
      status: 'pending',
      statusText: 'Under Review',
    },
    {
      id: 'PA-20251215-003',
      type: 'Specialist Consultation',
      provider: 'Dr. Johnson - Cardiologist',
      requestDate: '15 Dec 2025',
      procedureDate: '20 Dec 2025',
      estimatedAmount: 2500,
      approvedAmount: 2500,
      status: 'utilized',
      statusText: 'Utilized',
      utilizedDate: '20 Dec 2025',
    },
  ];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pre-Authorizations</h1>
            <p className="text-gray-600 mt-1">
              Request and track pre-authorization for medical procedures
            </p>
          </div>
          <Button onClick={() => setShowSubmitForm(!showSubmitForm)}>
            {showSubmitForm ? 'View Pre-Auths' : 'Request Pre-Auth'}
          </Button>
        </div>

        {/* Submit Pre-Auth Form */}
        {showSubmitForm && (
          <Card>
            <CardHeader>
              <CardTitle>Request Pre-Authorization</CardTitle>
              <CardDescription>Submit a pre-authorization request for a planned procedure</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="procedureType" className="text-sm font-medium">
                      Procedure Type
                    </label>
                    <select
                      id="procedureType"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option>Hospital Admission</option>
                      <option>Surgery</option>
                      <option>MRI Scan</option>
                      <option>CT Scan</option>
                      <option>Specialist Consultation</option>
                      <option>Dental Procedure</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="procedureDate" className="text-sm font-medium">
                      Planned Procedure Date
                    </label>
                    <Input id="procedureDate" type="date" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="provider" className="text-sm font-medium">
                      Provider/Hospital Name
                    </label>
                    <Input id="provider" placeholder="Sandton Mediclinic" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="estimatedAmount" className="text-sm font-medium">
                      Estimated Amount (R)
                    </label>
                    <Input id="estimatedAmount" type="number" placeholder="45000.00" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="diagnosis" className="text-sm font-medium">
                      Diagnosis Code (ICD-10)
                    </label>
                    <Input id="diagnosis" placeholder="I25.1" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="procedure" className="text-sm font-medium">
                      Procedure Code
                    </label>
                    <Input id="procedure" placeholder="0001" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="clinicalNotes" className="text-sm font-medium">
                    Clinical Notes
                  </label>
                  <textarea
                    id="clinicalNotes"
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Provide clinical justification for the procedure..."
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
                      Upload doctor's referral, test results, or other supporting documents
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Submit Request
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

        {/* Pre-Auth Summary */}
        {!showSubmitForm && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Requests</CardDescription>
                  <CardTitle className="text-2xl">3</CardTitle>
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
                  <CardTitle className="text-2xl text-green-600">1</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Utilized</CardDescription>
                  <CardTitle className="text-2xl text-blue-600">1</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Pre-Auth List */}
            <Card>
              <CardHeader>
                <CardTitle>Pre-Authorization Requests</CardTitle>
                <CardDescription>Track the status of your pre-authorization requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {preauths.map((preauth) => (
                    <div
                      key={preauth.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="flex items-start justify-between p-4 bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-medium text-lg">{preauth.type}</p>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                preauth.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : preauth.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : preauth.status === 'utilized'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {preauth.statusText}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 font-mono">{preauth.id}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Provider</p>
                            <p className="text-sm font-medium mt-1">{preauth.provider}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Request Date</p>
                            <p className="text-sm font-medium mt-1">{preauth.requestDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Procedure Date</p>
                            <p className="text-sm font-medium mt-1">{preauth.procedureDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Estimated Amount</p>
                            <p className="text-sm font-medium mt-1">R{preauth.estimatedAmount.toLocaleString()}</p>
                          </div>
                        </div>

                        {preauth.status === 'approved' && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-900">
                                  Approved Amount: R{preauth.approvedAmount?.toLocaleString()}
                                </p>
                                <p className="text-xs text-green-700 mt-1">
                                  Valid until: {preauth.expiryDate}
                                </p>
                                {preauth.conditions && (
                                  <p className="text-xs text-green-700 mt-1">
                                    Conditions: {preauth.conditions}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {preauth.status === 'pending' && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-yellow-900">
                                  Under Clinical Review
                                </p>
                                <p className="text-xs text-yellow-700 mt-1">
                                  We're reviewing your request. You'll be notified within 2 business days.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {preauth.status === 'utilized' && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-blue-900">
                                  Pre-Authorization Utilized
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                  Utilized on: {preauth.utilizedDate}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>About Pre-Authorization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    Pre-authorization is required for certain medical procedures to ensure they are medically necessary and covered under your plan.
                  </p>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">When is pre-authorization required?</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Hospital admissions</li>
                      <li>Surgical procedures</li>
                      <li>MRI and CT scans</li>
                      <li>Specialist consultations (certain cases)</li>
                      <li>Expensive medications</li>
                    </ul>
                  </div>
                  <p className="text-xs text-gray-500">
                    Note: Emergency procedures do not require pre-authorization. Please submit your request at least 5 business days before the planned procedure.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
