'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, DollarSign, Calendar } from 'lucide-react';

interface Claim {
  id: string;
  claim_number: string;
  benefit_type: string;
  service_date: string;
  submission_date: string;
  claimed_amount: string;
  approved_amount: string | null;
  claim_status: string;
  rejection_reason: string | null;
  pend_reason: string | null;
  approved_date: string | null;
  paid_date: string | null;
  payment_reference: string | null;
  providers: {
    practice_name: string;
    provider_type: string;
  } | null;
}

interface Stats {
  total: number;
  submitted: number;
  pending: number;
  approved: number;
  paid: number;
  rejected: number;
  pended: number;
  total_claimed: number;
  total_approved: number;
  total_paid: number;
}

export default function MemberClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // TODO: Get member_id from authenticated session
  const memberId = 'temp-member-id'; // Replace with actual member ID from auth

  useEffect(() => {
    fetchClaims();
  }, [statusFilter, dateFrom, dateTo]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        member_id: memberId
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await fetch(`/api/member/claims?${params}`);
      if (response.ok) {
        const data = await response.json();
        setClaims(data.claims || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; icon: any }> = {
      submitted: { bg: 'bg-blue-100 text-blue-800', icon: FileText },
      pending: { bg: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { bg: 'bg-green-100 text-green-800', icon: CheckCircle },
      paid: { bg: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100 text-red-800', icon: XCircle },
      pended: { bg: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
    };

    const style = styles[status] || { bg: 'bg-gray-100 text-gray-800', icon: FileText };
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your claims...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Claims</h1>
          <p className="text-gray-600 mt-1">View and track your claim submissions</p>
        </div>
        <Button onClick={() => router.push('/member/claims/submit')} className="bg-green-600 hover:bg-green-700">
          + Submit New Claim
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Claims</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.submitted + stats.pending + stats.pended}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Paid</p>
                  <p className="text-xl font-bold text-purple-600">
                    R{stats.total_paid.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
                <option value="pended">Pended</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims List */}
      {claims.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
              <p className="text-gray-500 mb-6">
                {statusFilter || dateFrom || dateTo
                  ? 'Try adjusting your filters or submit your first claim.'
                  : 'Get started by submitting your first claim.'}
              </p>
              <Button onClick={() => router.push('/member/claims/submit')} className="bg-green-600 hover:bg-green-700">
                Submit a Claim
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card 
              key={claim.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/claims/${claim.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-mono">{claim.claim_number}</CardTitle>
                    <CardDescription className="mt-1">
                      {claim.benefit_type} • {claim.providers?.practice_name || 'Unknown Provider'}
                    </CardDescription>
                  </div>
                  {getStatusBadge(claim.claim_status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Service Date</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {new Date(claim.service_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Claimed Amount</p>
                    <p className="font-medium">
                      R{parseFloat(claim.claimed_amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Approved Amount</p>
                    <p className="font-medium text-green-600">
                      {claim.approved_amount
                        ? `R${parseFloat(claim.approved_amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Submitted</p>
                    <p className="font-medium text-sm">
                      {new Date(claim.submission_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Payment Status</p>
                    <p className="font-medium text-sm">
                      {claim.paid_date ? (
                        <span className="text-green-600">Paid {new Date(claim.paid_date).toLocaleDateString()}</span>
                      ) : claim.approved_date ? (
                        <span className="text-blue-600">Approved</span>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Show rejection/pend reason if applicable */}
                {claim.rejection_reason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-700">{claim.rejection_reason}</p>
                  </div>
                )}

                {claim.pend_reason && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <p className="text-sm font-medium text-orange-800 mb-1">Additional Information Required:</p>
                    <p className="text-sm text-orange-700">{claim.pend_reason}</p>
                  </div>
                )}

                {claim.payment_reference && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm font-medium text-green-800 mb-1">Payment Reference:</p>
                    <p className="text-sm font-mono text-green-700">{claim.payment_reference}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Status Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge('submitted')}
                <span className="font-medium">Submitted</span>
              </div>
              <p className="text-gray-600">Claim received, awaiting initial review</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge('pending')}
                <span className="font-medium">Pending</span>
              </div>
              <p className="text-gray-600">Under review by claims assessor</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge('pended')}
                <span className="font-medium">Pended</span>
              </div>
              <p className="text-gray-600">Additional information required</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge('approved')}
                <span className="font-medium">Approved</span>
              </div>
              <p className="text-gray-600">Claim approved, payment scheduled</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge('paid')}
                <span className="font-medium">Paid</span>
              </div>
              <p className="text-gray-600">Payment processed and completed</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge('rejected')}
                <span className="font-medium">Rejected</span>
              </div>
              <p className="text-gray-600">Claim rejected, contact support for details</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
