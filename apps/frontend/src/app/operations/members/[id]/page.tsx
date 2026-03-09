'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Collapse, CollapseGroup } from '@/components/ui/collapse';

interface Member {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended' | 'cancelled' | 'in_waiting';
  brokerCode: string;
  brokerName: string;
  policyNumber: string;
  product: string;
  planId: string;
  paymentMethod: string;
  monthlyPremium: number;
  joinDate: string;
  kycStatus: 'pending' | 'verified' | 'failed';
  riskScore: number;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
  dateOfBirth?: string;
  gender?: string;
  bankName?: string;
  accountNumber?: string;
  branchCode?: string;
  debitOrderDay?: number;
}

export default function OperationsMemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;
  
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberDetails();
  }, [memberId]);

  const fetchMemberDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/members/${memberId}`);
      if (response.ok) {
        const data = await response.json();
        setMember(data);
      }
    } catch (error) {
      console.error('Failed to fetch member details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Member['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
      in_waiting: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const getKycBadge = (kycStatus: Member['kycStatus']) => {
    const styles = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[kycStatus]}`}>
        {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading member details...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!member) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">Member not found</p>
            <Button onClick={() => router.push('/operations/members')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Members
            </Button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/operations/members')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {member.firstName} {member.lastName}
              </h1>
              <p className="text-gray-600 mt-1">Member #{member.memberNumber}</p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Status</p>
                <div className="mt-2">{getStatusBadge(member.status)}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">KYC Status</p>
                <div className="mt-2">{getKycBadge(member.kycStatus)}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Monthly Premium</p>
                <p className="text-2xl font-bold mt-1 text-green-600">R {member.monthlyPremium}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Risk Score</p>
                <p className="text-2xl font-bold mt-1">{member.riskScore}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div style={{ maxWidth: '521px' }}>
            <Card>
              <CardContent className="p-0">
                <CollapseGroup>
                  <Collapse title="Personal Information" size="small">
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-600">Full Name</p>
                        <p className="font-medium">{member.firstName} {member.lastName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">ID Number</p>
                        <p className="font-medium font-mono text-xs">{member.idNumber}</p>
                      </div>
                      {member.dateOfBirth && (
                        <div>
                          <p className="text-xs text-gray-600">Date of Birth</p>
                          <p className="font-medium">{new Date(member.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                      )}
                      {member.gender && (
                        <div>
                          <p className="text-xs text-gray-600">Gender</p>
                          <p className="font-medium capitalize">{member.gender}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-600">Join Date</p>
                        <p className="font-medium">{member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </Collapse>

                  <Collapse title="Contact Information" size="small">
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="font-medium">{member.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Phone</p>
                        <p className="font-medium">{member.phone}</p>
                      </div>
                      {member.addressLine1 && (
                        <div>
                          <p className="text-xs text-gray-600">Address</p>
                          <p className="font-medium">{member.addressLine1}</p>
                          {member.city && member.postalCode && (
                            <p className="font-medium">{member.city}, {member.postalCode}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </Collapse>

                  <Collapse title="Policy Information" size="small">
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-600">Policy Number</p>
                        <p className="font-medium font-mono text-xs">{member.policyNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Plan</p>
                        <p className="font-medium">{member.product || <span className="text-red-500">No Plan Assigned</span>}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Monthly Premium</p>
                        <p className="font-medium text-green-600">R {member.monthlyPremium}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Payment Method</p>
                        <p className="font-medium">{member.paymentMethod}</p>
                      </div>
                    </div>
                  </Collapse>

                  <Collapse title="Banking Details" size="small">
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-600">Bank Name</p>
                        <p className="font-medium">{member.bankName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Account Number</p>
                        <p className="font-medium font-mono text-xs">{member.accountNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Branch Code</p>
                        <p className="font-medium font-mono text-xs">{member.branchCode || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Debit Order Day</p>
                        <p className="font-medium">{member.debitOrderDay ? `${member.debitOrderDay} of each month` : 'N/A'}</p>
                      </div>
                    </div>
                  </Collapse>
                </CollapseGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div style={{ maxWidth: '521px' }}>
            <Card>
              <CardContent className="p-0">
                <CollapseGroup>
                  {member.brokerCode && member.brokerName && (
                    <Collapse title="Broker Information" size="small">
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-600">Broker Code</p>
                          <p className="font-medium font-mono text-xs">{member.brokerCode}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Broker Name</p>
                          <p className="font-medium">{member.brokerName}</p>
                        </div>
                      </div>
                    </Collapse>
                  )}

                  <Collapse title="Payments" size="small">
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">Payment history and transactions will be displayed here.</p>
                    </div>
                  </Collapse>

                  <Collapse title="Claims" size="small">
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">Claims history and status will be displayed here.</p>
                    </div>
                  </Collapse>

                  <Collapse title="Documents" size="small">
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">Member documents will be displayed here.</p>
                    </div>
                  </Collapse>
                </CollapseGroup>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
