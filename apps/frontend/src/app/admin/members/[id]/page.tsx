'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, CreditCard, Activity, Trash2 } from 'lucide-react';
import { Collapse, CollapseGroup } from '@/components/ui/collapse';

interface Member {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  mobile?: string;
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

export default function MemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;
  
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Member>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditSection = (section: string) => {
    setEditingSection(section);
    setEditedData(member || {});
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditedData({});
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData),
      });
      
      if (response.ok) {
        const updated = await response.json();
        setMember(updated);
        setEditingSection(null);
        setEditedData({});
      }
    } catch (error) {
      console.error('Failed to update member:', error);
    }
  };

  const handleFieldChange = (field: keyof Member, value: any) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteMember = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/members/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Redirect to members list after successful deletion
        router.push('/admin/members');
      } else {
        const error = await response.json();
        alert(`Failed to delete member: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete member:', error);
      alert('Failed to delete member. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    }
  };

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
            <Button onClick={() => router.push('/admin/members')}>
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
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/members')}>
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              View Policy
            </Button>
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
                  <Collapse title="Personal Information" size="small" showEdit onEdit={() => handleEditSection('personal')}>
                    {editingSection === 'personal' ? (
                      <div className="space-y-3 text-sm">
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">First Name</label>
                          <input
                            type="text"
                            value={editedData.firstName || ''}
                            onChange={(e) => handleFieldChange('firstName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Last Name</label>
                          <input
                            type="text"
                            value={editedData.lastName || ''}
                            onChange={(e) => handleFieldChange('lastName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">ID Number</label>
                          <input
                            type="text"
                            value={editedData.idNumber || ''}
                            onChange={(e) => handleFieldChange('idNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={editedData.dateOfBirth ? new Date(editedData.dateOfBirth).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Gender</label>
                          <select
                            value={editedData.gender || ''}
                            onChange={(e) => handleFieldChange('gender', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
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
                    )}
                  </Collapse>

                  <Collapse title="Contact Information" size="small" showEdit onEdit={() => handleEditSection('contact')}>
                    {editingSection === 'contact' ? (
                      <div className="space-y-3 text-sm">
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Email</label>
                          <input
                            type="email"
                            value={editedData.email || ''}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Mobile</label>
                          <input
                            type="tel"
                            value={editedData.mobile || ''}
                            onChange={(e) => handleFieldChange('mobile', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Phone (Landline)</label>
                          <input
                            type="tel"
                            value={editedData.phone || ''}
                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Address</label>
                          <input
                            type="text"
                            value={editedData.addressLine1 || ''}
                            onChange={(e) => handleFieldChange('addressLine1', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">City</label>
                          <input
                            type="text"
                            value={editedData.city || ''}
                            onChange={(e) => handleFieldChange('city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Postal Code</label>
                          <input
                            type="text"
                            value={editedData.postalCode || ''}
                            onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-600">Email</p>
                          <p className="font-medium">{member.email}</p>
                        </div>
                        {member.mobile && (
                          <div>
                            <p className="text-xs text-gray-600">Mobile</p>
                            <p className="font-medium">{member.mobile}</p>
                          </div>
                        )}
                        {member.phone && (
                          <div>
                            <p className="text-xs text-gray-600">Phone (Landline)</p>
                            <p className="font-medium">{member.phone}</p>
                          </div>
                        )}
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
                    )}
                  </Collapse>

                  <Collapse title="Policy Information" size="small" showEdit onEdit={() => handleEditSection('policy')}>
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

                  <Collapse title="Banking Details" size="small" showEdit onEdit={() => handleEditSection('banking')}>
                    {editingSection === 'banking' ? (
                      <div className="space-y-3 text-sm">
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Bank Name</label>
                          <input
                            type="text"
                            value={editedData.bankName || ''}
                            onChange={(e) => handleFieldChange('bankName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Account Number</label>
                          <input
                            type="text"
                            value={editedData.accountNumber || ''}
                            onChange={(e) => handleFieldChange('accountNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Branch Code</label>
                          <input
                            type="text"
                            value={editedData.branchCode || ''}
                            onChange={(e) => handleFieldChange('branchCode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Debit Order Day</label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={editedData.debitOrderDay || ''}
                            onChange={(e) => handleFieldChange('debitOrderDay', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
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
                    )}
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
                    <Collapse title="Broker Information" size="small" showEdit onEdit={() => handleEditSection('broker')}>
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

            {/* Delete Member Card */}
            <Card className="mt-4 border-red-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-100 rounded">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">Delete Member</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      Permanently delete this account. Cannot be undone.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50 text-xs h-7 px-2"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete Member
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Member Account</h2>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    You are about to permanently delete:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="font-semibold text-gray-900">{member.firstName} {member.lastName}</p>
                    <p className="text-sm text-gray-600">Member #{member.memberNumber}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-800 font-medium mb-2">⚠️ Warning: This action cannot be undone</p>
                    <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                      <li>All member data will be permanently deleted</li>
                      <li>Policy information will be removed</li>
                      <li>Payment history will be deleted</li>
                      <li>Claims records will be removed</li>
                    </ul>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">delete</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type 'delete' here"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleDeleteMember}
                    disabled={deleteConfirmText.toLowerCase() !== 'delete' || isDeleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Permanently
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText('');
                    }}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </SidebarLayout>
  );
}

    