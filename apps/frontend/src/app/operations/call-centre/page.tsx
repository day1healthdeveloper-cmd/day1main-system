'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UpgradeVerificationForm } from '@/components/call-centre/upgrade-verification-form';
import DependantVerificationForm from '@/components/call-centre/dependant-verification-form';
import { 
  ArrowUpCircle,
  Phone,
  User,
  X
} from 'lucide-react';

interface UpgradeRequest {
  id: string;
  member_id: string;
  mobile_number: string;
  member_first_name: string;
  member_last_name: string;
  member_email: string;
  current_plan: string;
  upgraded_plan: string;
  current_price: number;
  upgraded_price: number;
  status: string;
  verification_notes?: string;
  call_recording_url?: string;
  verified_at?: string;
  verified_by?: string;
  requested_at: string;
}

interface DependantRequest {
  id: string;
  member_id: string;
  mobile_number: string;
  member_first_name: string;
  member_last_name: string;
  member_email: string;
  dependant_first_name: string;
  dependant_last_name: string;
  dependant_id_number: string;
  dependant_date_of_birth: string;
  dependant_gender: string;
  dependant_relationship: string;
  id_document_url?: string;
  birth_certificate_url?: string;
  marriage_certificate_url?: string;
  current_premium: number;
  dependant_cost: number;
  new_premium: number;
  status: string;
  verification_notes?: string;
  call_recording_url?: string;
  verified_at?: string;
  verified_by?: string;
  requested_at: string;
}

export default function OperationsCallCentrePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'upgrades' | 'dependants'>('upgrades');
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([]);
  const [dependantRequests, setDependantRequests] = useState<DependantRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(null);
  const [selectedDependantRequest, setSelectedDependantRequest] = useState<DependantRequest | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showDependantModal, setShowDependantModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadUpgradeRequests();
    loadDependantRequests();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const loadUpgradeRequests = async () => {
    setLoadingRequests(true);
    try {
      // Load ALL upgrade requests (pending and verified) - not just verified
      const response = await fetch('/api/plus1/upgrade-requests?includeMembers=true');
      const data = await response.json();
      // Filter to show pending and verified only (not approved or rejected)
      const activeRequests = (data.upgradeRequests || []).filter(
        (req: UpgradeRequest) => req.status === 'pending' || req.status === 'verified'
      );
      setUpgradeRequests(activeRequests);
    } catch (error) {
      console.error('Error loading upgrade requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadDependantRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await fetch('/api/plus1/dependant-requests?includeMembers=true');
      const data = await response.json();
      // Filter to show pending and verified only (not approved or rejected)
      const activeRequests = (data.requests || []).filter(
        (req: DependantRequest) => req.status === 'pending' || req.status === 'verified'
      );
      setDependantRequests(activeRequests);
    } catch (error) {
      console.error('Error loading dependant requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleVerify = async (notes: string, recordingUrl: string) => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/plus1/upgrade-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          verification_notes: notes,
          call_recording_url: recordingUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify upgrade request');
      }
      
      // Reload requests
      await loadUpgradeRequests();
      setShowVerificationModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error verifying upgrade:', error);
      throw error;
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/plus1/upgrade-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          rejection_reason: reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject upgrade request');
      }
      
      // Reload requests
      await loadUpgradeRequests();
      setShowVerificationModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting upgrade:', error);
      throw error;
    }
  };

  const handleDependantSuccess = async () => {
    await loadDependantRequests();
    setShowDependantModal(false);
    setSelectedDependantRequest(null);
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Call Centre Queue</h2>
          <p className="text-gray-600 mt-1">Review and process member requests</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'upgrades'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Member Upgrades
            {upgradeRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                {upgradeRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('dependants')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'dependants'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dependant Requests
            {dependantRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs">
                {dependantRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Upgrade Requests Tab */}
        {activeTab === 'upgrades' && (
          <Card>
            <CardHeader>
              <CardTitle>Upgrade Requests</CardTitle>
              <CardDescription>Member upgrade requests - pending verification and verified requests ready for approval</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading upgrade requests...</p>
                </div>
              ) : upgradeRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ArrowUpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No pending upgrade requests</p>
                  <p className="text-xs mt-1">Upgrade requests will appear here when members submit them</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upgradeRequests.map((request) => (
                    <div 
                      key={request.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{request.member_first_name} {request.member_last_name}</p>
                            <p className="text-sm text-gray-600">{request.mobile_number}</p>
                          </div>
                        </div>
                        {request.status === 'pending' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            PENDING VERIFICATION
                          </span>
                        ) : request.status === 'verified' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            PENDING APPROVAL
                          </span>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Current Plan</p>
                          <p className="font-medium">{request.current_plan}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Current Price</p>
                          <p className="font-medium">R{request.current_price?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Upgraded Plan</p>
                          <p className="font-medium text-blue-600">{request.upgraded_plan}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">New Price</p>
                          <p className="font-medium text-blue-600">R{request.upgraded_price?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>Requested: {new Date(request.requested_at).toLocaleString()}</span>
                        <span>Increase: R{((request.upgraded_price || 0) - (request.current_price || 0)).toFixed(2)}/month</span>
                      </div>

                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowVerificationModal(true);
                        }}
                      >
                        {request.status === 'pending' ? (
                          <>
                            <Phone className="w-3 h-3 mr-1" />
                            Start Verification Call
                          </>
                        ) : (
                          <>
                            <Phone className="w-3 h-3 mr-1" />
                            Check Upgrade Verification
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dependant Requests Tab */}
        {activeTab === 'dependants' && (
          <Card>
            <CardHeader>
              <CardTitle>Dependant Requests</CardTitle>
              <CardDescription>Member dependant addition requests - pending verification and verified requests ready for approval</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading dependant requests...</p>
                </div>
              ) : dependantRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No pending dependant requests</p>
                  <p className="text-xs mt-1">Dependant requests will appear here when members submit them</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dependantRequests.map((request) => (
                    <div 
                      key={request.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{request.member_first_name} {request.member_last_name}</p>
                            <p className="text-sm text-gray-600">{request.mobile_number}</p>
                          </div>
                        </div>
                        {request.status === 'pending' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            PENDING VERIFICATION
                          </span>
                        ) : request.status === 'verified' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            PENDING APPROVAL
                          </span>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Dependant</p>
                          <p className="font-medium">{request.dependant_first_name} {request.dependant_last_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Relationship</p>
                          <p className="font-medium capitalize">{request.dependant_relationship}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Current Premium</p>
                          <p className="font-medium">R{request.current_premium?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">New Premium</p>
                          <p className="font-medium text-green-600">R{request.new_premium?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>Requested: {new Date(request.requested_at).toLocaleString()}</span>
                        <span>Increase: R{((request.new_premium || 0) - (request.current_premium || 0)).toFixed(2)}/month</span>
                      </div>

                      <Button
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedDependantRequest(request);
                          setShowDependantModal(true);
                        }}
                      >
                        {request.status === 'pending' ? (
                          <>
                            <Phone className="w-3 h-3 mr-1" />
                            Start Verification Call
                          </>
                        ) : (
                          <>
                            <Phone className="w-3 h-3 mr-1" />
                            Check Dependant Verification
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Verification Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Verify Upgrade Request</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVerificationModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              {/* Member Info */}
              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Member Name</p>
                      <p className="font-medium">{selectedRequest.member_first_name} {selectedRequest.member_last_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Mobile Number</p>
                      <p className="font-medium">{selectedRequest.mobile_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Current Plan</p>
                      <p className="font-medium">{selectedRequest.current_plan}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Upgraded Plan</p>
                      <p className="font-medium text-blue-600">{selectedRequest.upgraded_plan}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Form */}
              <UpgradeVerificationForm
                upgradeRequest={selectedRequest}
                onVerify={handleVerify}
                onReject={handleReject}
                userRole={user?.roles?.includes('operations_manager') ? 'operations_manager' : 'call_centre_agent'}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dependant Verification Modal */}
      <Dialog open={showDependantModal} onOpenChange={setShowDependantModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Verify Dependant Request</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDependantModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedDependantRequest && (
            <DependantVerificationForm
              request={selectedDependantRequest}
              userRole={user?.roles?.includes('operations_manager') ? 'operations_manager' : 'call_centre'}
              onClose={() => setShowDependantModal(false)}
              onSuccess={handleDependantSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
}
