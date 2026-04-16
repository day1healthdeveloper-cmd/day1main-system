'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MemberData {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  plan_name: string;
  plan_id: string | null;
  status: string;
  monthly_premium: number;
  next_debit_date: string;
  broker_code: string;
  email: string;
  mobile: string;
  start_date: string;
}

interface MemberStats {
  activeClaims: number;
  pendingClaims: number;
  totalClaimsPaid: number;
  lastPaymentDate: string;
  lastPaymentAmount: number;
}

interface PlanBenefit {
  id: string;
  name: string;
  type: string;
  description: string | null;
  cover_amount: string | null;
  waiting_period_days: number | null;
  annual_limit: number | null;
  day_1_amount: number | null;
  day_2_amount: number | null;
  day_3_amount: number | null;
  daily_amount_after: number | null;
  max_days: number | null;
  family_cover_amount: number | null;
  principal_amount: number | null;
  spouse_amount: number | null;
  child_14_amount: number | null;
  notes: string | null;
}

export default function MemberDashboardPage() {
  const router = useRouter();
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planBenefits, setPlanBenefits] = useState<PlanBenefit[]>([]);
  const [loadingBenefits, setLoadingBenefits] = useState(false);

  useEffect(() => {
    // Check if member is logged in
    const memberSession = localStorage.getItem('member_session');
    const memberDataStr = localStorage.getItem('member_data');
    
    if (!memberSession || !memberDataStr) {
      router.push('/login');
      return;
    }

    // Get member ID from localStorage to fetch fresh data
    try {
      const storedMemberData = JSON.parse(memberDataStr);
      fetchMemberData(storedMemberData.id);
    } catch (error) {
      console.error('Error parsing member data:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchMemberData = async (memberId: string) => {
    try {
      // Fetch fresh member data from database
      const response = await fetch(`/api/member/profile?id=${memberId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch member data');
      }

      const data = await response.json();
      
      if (data.member) {
        setMemberData(data.member);
        // Update localStorage with fresh data
        localStorage.setItem('member_data', JSON.stringify(data.member));
        fetchMemberStats(data.member.id);
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
      // Fallback to localStorage if API fails
      const memberDataStr = localStorage.getItem('member_data');
      if (memberDataStr) {
        const storedMemberData = JSON.parse(memberDataStr);
        setMemberData(storedMemberData);
        fetchMemberStats(storedMemberData.id);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const fetchMemberStats = async (memberId: string) => {
    try {
      // TODO: Implement member stats API endpoint
      // For now, set dummy stats
      setStats({
        activeClaims: 0,
        pendingClaims: 0,
        totalClaimsPaid: 0,
        lastPaymentDate: '',
        lastPaymentAmount: 0
      });
    } catch (error) {
      console.error('Error fetching member stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('member_session');
    localStorage.removeItem('member_data');
    router.push('/login');
  };

  const handleViewPlanBenefits = async () => {
    if (!memberData?.plan_id) {
      alert('Plan benefits not available');
      return;
    }

    setShowPlanModal(true);
    setLoadingBenefits(true);

    try {
      const response = await fetch(`/api/admin/products/${memberData.plan_id}/benefits`);
      if (response.ok) {
        const data = await response.json();
        setPlanBenefits(data.benefits || []);
      }
    } catch (error) {
      console.error('Error fetching plan benefits:', error);
    } finally {
      setLoadingBenefits(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {memberData?.first_name || 'Member'}
              </h1>
              <p className="text-sm text-gray-600">
                Member Number: {memberData?.member_number || 'Loading...'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/member/profile')}>
                View Profile
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {memberData?.status === 'active' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-medium">Your policy is active and up to date</span>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-xl font-bold mt-1">{memberData?.plan_name || 'N/A'}</p>
                {memberData?.plan_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={handleViewPlanBenefits}
                  >
                    View Benefits
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Monthly Premium</p>
                <p className="text-xl font-bold mt-1 text-blue-600">
                  R{memberData?.monthly_premium ? parseFloat(memberData.monthly_premium.toString()).toLocaleString() : '0'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Active Claims</p>
                <p className="text-xl font-bold mt-1 text-orange-600">
                  {stats?.activeClaims || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Next Debit</p>
                <p className="text-xl font-bold mt-1">
                  {memberData?.next_debit_date ? new Date(memberData.next_debit_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Claims */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
              <CardDescription>Your latest claim submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>No recent claims</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.push('/member/claims/submit')}
                >
                  Submit a Claim
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/member/claims/submit')}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Submit a Claim
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/member/claims')}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View All Claims
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/member/documents')}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  My Documents
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/member/dependants')}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Manage Dependants
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Your payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Last Payment</p>
                  <p className="text-lg font-semibold">
                    {stats?.lastPaymentDate 
                      ? new Date(stats.lastPaymentDate).toLocaleDateString() 
                      : 'No payments yet'}
                  </p>
                  {stats?.lastPaymentAmount && (
                    <p className="text-sm text-gray-600">
                      R{parseFloat(stats.lastPaymentAmount.toString()).toLocaleString()}
                    </p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/member/payments')}
                >
                  View Payment History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Contact our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Call Centre</p>
                  <p className="text-lg font-semibold">0800 123 456</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold">support@day1health.co.za</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hours</p>
                  <p className="text-sm">Monday - Friday: 8am - 5pm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Plan Benefits Modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Your Plan Benefits</DialogTitle>
            <DialogDescription>
              {memberData?.plan_name}
            </DialogDescription>
          </DialogHeader>

          {loadingBenefits ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : planBenefits.length > 0 ? (
            <div className="space-y-4 mt-4">
              {planBenefits.map((benefit) => {
                // Determine cover amount display
                let coverDisplay = 'Not specified';
                if (benefit.cover_amount) {
                  coverDisplay = benefit.cover_amount;
                } else if (benefit.annual_limit) {
                  coverDisplay = `${benefit.annual_limit} visits per year`;
                } else if (benefit.day_1_amount) {
                  coverDisplay = `R${benefit.day_1_amount.toLocaleString()} per day`;
                } else if (benefit.principal_amount) {
                  coverDisplay = `R${benefit.principal_amount.toLocaleString()}`;
                } else if (benefit.family_cover_amount) {
                  coverDisplay = `R${benefit.family_cover_amount.toLocaleString()}`;
                }

                // Determine waiting period display and calculate countdown
                let waitingDisplay = 'Immediate cover';
                let coverStartDate: Date | null = null;
                let daysRemaining = 0;
                let isActive = true;

                if (benefit.waiting_period_days && benefit.waiting_period_days > 0 && memberData?.start_date) {
                  const startDate = new Date(memberData.start_date);
                  coverStartDate = new Date(startDate);
                  coverStartDate.setDate(coverStartDate.getDate() + benefit.waiting_period_days);
                  
                  const today = new Date();
                  const timeDiff = coverStartDate.getTime() - today.getTime();
                  daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                  isActive = daysRemaining <= 0;

                  if (benefit.waiting_period_days >= 365) {
                    const years = Math.floor(benefit.waiting_period_days / 365);
                    waitingDisplay = `${years} year${years > 1 ? 's' : ''} waiting period`;
                  } else if (benefit.waiting_period_days >= 30) {
                    const months = Math.floor(benefit.waiting_period_days / 30);
                    waitingDisplay = `${months} month${months > 1 ? 's' : ''} waiting period`;
                  } else {
                    waitingDisplay = `${benefit.waiting_period_days} days waiting period`;
                  }
                }

                return (
                  <div
                    key={benefit.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {benefit.name}
                        </h3>
                        {benefit.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {benefit.description}
                          </p>
                        )}
                        <div className="mt-3 space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Cover:</span>{' '}
                            <span className="text-blue-600 font-semibold">
                              {coverDisplay}
                            </span>
                          </p>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Waiting Period:</span>{' '}
                            <span className={waitingDisplay === 'Immediate cover' ? 'text-green-600 font-semibold' : 'text-orange-600'}>
                              {waitingDisplay}
                            </span>
                            
                            {/* Countdown Timer - only show if there's a waiting period > 0 */}
                            {benefit.waiting_period_days > 0 && coverStartDate && (
                              <div className="mt-2 flex items-center gap-2">
                                {isActive ? (
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-semibold text-green-700">
                                      Active - Cover started {coverStartDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-md">
                                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-orange-700">
                                      {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} until cover starts
                                    </span>
                                    <span className="text-xs text-orange-600">
                                      ({coverStartDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })})
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full whitespace-nowrap">
                        {benefit.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No benefits information available</p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setShowPlanModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
