'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { 
  FileText, 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin,
  Users,
  CreditCard,
  Heart,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Play
} from 'lucide-react';

interface Application {
  id: string
  application_number: string
  contact_id: string
  first_name: string
  last_name: string
  id_number: string
  date_of_birth: string
  gender: string
  email: string
  mobile: string
  address_line1: string
  address_line2: string
  city: string
  postal_code: string
  plan_name: string
  monthly_price: number
  status: string
  submitted_at: string
  created_at: string
  dependents: any[]
  contact: {
    email: string
    first_name: string
    last_name: string
    mobile: string
    marketing_consent: boolean
    source: string
    tags: string[]
  }
  id_document_url: string
  proof_of_address_url: string
  proof_of_address_urls: string[]
  selfie_url: string
  bank_name: string
  account_number: string
  branch_code: string
  account_holder_name: string
  debit_order_day: number
  collection_method: string
  medical_history: any
  marketing_consent: boolean
  review_notes: string
  rejection_reason: string
  voice_recording_url?: string
  terms_accepted_at?: string
  signature_url?: string
  email_consent?: boolean
  sms_consent?: boolean
  phone_consent?: boolean
}

interface Stats {
  total: number
  submitted: number
  under_review: number
  approved: number
  rejected: number
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showIdDocument, setShowIdDocument] = useState(false);
  const [showProofOfAddress, setShowProofOfAddress] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications');
      const data = await response.json();
      setApplications(data.applications || []);
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus} this application?`)) {
      return;
    }

    setProcessing(true);
    
    // Show processing notification
    addToast({
      type: 'info',
      title: '⏳ Processing...',
      description: `${newStatus === 'approved' ? 'Approving application and creating member record' : 'Rejecting application'}...`,
      duration: 2000,
    });

    try {
      const response = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
          reviewNotes: reviewNotes || undefined,
          rejectionReason: newStatus === 'rejected' ? rejectionReason : undefined,
          // reviewedBy will be null for now - can be updated when auth context is available
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success notification
        if (newStatus === 'approved') {
          addToast({
            type: 'success',
            title: '✅ Application Approved!',
            description: `Member ${data.member?.member_number || ''} has been created successfully. Welcome email will be sent shortly.`,
            duration: 5000,
          });
        } else if (newStatus === 'rejected') {
          addToast({
            type: 'error',
            title: '❌ Application Rejected',
            description: `Application has been rejected. Applicant will be notified via email.`,
            duration: 5000,
          });
        }
        
        setShowDetails(false);
        setReviewNotes('');
        setRejectionReason('');
        fetchApplications();
      } else {
        // Show error notification
        addToast({
          type: 'error',
          title: '⚠️ Update Failed',
          description: data.details || data.error || 'Failed to update application. Please try again.',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Failed to update application:', error);
      addToast({
        type: 'error',
        title: '⚠️ Network Error',
        description: 'Unable to connect to server. Please check your connection and try again.',
        duration: 5000,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id_number.includes(searchTerm);
    const matchesStatus = !statusFilter || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Member Applications</h1>
            <p className="text-gray-600 mt-1">Review and process membership applications</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.submitted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.under_review}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.approved}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.rejected}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Application number, name, email, ID..." 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                  />
                  <Button onClick={handleSearch} className="whitespace-nowrap">
                    Search
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Click to select</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Member Applications</CardTitle>
                <CardDescription>Showing {filteredApplications.length} of {applications.length} applications</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No applications found</p>
                <p className="text-sm text-gray-500 mt-1">Applications will appear here when users submit them</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApplications.map((app) => (
                  <div 
                    key={app.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedApplication(app);
                      setShowDetails(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{app.first_name} {app.last_name}</p>
                          <p className="text-sm text-gray-600">{app.application_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {app.status === 'under_review' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                            ✓ VERIFIED
                          </span>
                        )}
                        {getStatusBadge(app.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Plan</p>
                        <p className="font-medium">{app.plan_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Monthly Premium</p>
                        <p className="font-medium">R{app.monthly_price?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Dependants</p>
                        <p className="font-medium">{app.dependents?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Submitted</p>
                        <p className="font-medium">{new Date(app.submitted_at || app.created_at).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApplication(app);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                      {(app.status === 'submitted' || app.status === 'under_review') && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(app.id, 'approved');
                            }}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApplication(app);
                              setShowDetails(true);
                            }}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Details Modal */}
        {showDetails && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Member Application Details</h2>
                  <p className="text-gray-600">{selectedApplication.application_number}</p>
                </div>
                <Button variant="outline" onClick={() => {
                  setShowDetails(false);
                  setShowIdDocument(false);
                  setShowProofOfAddress(false);
                }}>Close</Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Full Name</p>
                        <p className="font-medium">{selectedApplication.first_name} {selectedApplication.last_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">ID Number</p>
                        <p className="font-medium">{selectedApplication.id_number}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Date of Birth</p>
                        <p className="font-medium">{new Date(selectedApplication.date_of_birth).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Gender</p>
                        <p className="font-medium">{selectedApplication.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-medium">{selectedApplication.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Mobile</p>
                        <p className="font-medium">{selectedApplication.mobile}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <p>{selectedApplication.address_line1}</p>
                      {selectedApplication.address_line2 && <p>{selectedApplication.address_line2}</p>}
                      <p>{selectedApplication.city}, {selectedApplication.postal_code}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Plan Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Plan Name</p>
                        <p className="font-medium">{selectedApplication.plan_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Monthly Premium</p>
                        <p className="font-medium text-lg">R{selectedApplication.monthly_price?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dependants */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Dependants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedApplication.dependents && selectedApplication.dependents.length > 0 ? (
                      <div className="space-y-3">
                        {selectedApplication.dependents.map((dep, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded">
                            <p className="font-medium">{dep.first_name} {dep.last_name}</p>
                            <p className="text-sm text-gray-600">{dep.relationship} • DOB: {new Date(dep.date_of_birth).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No dependants added</p>
                    )}
                  </CardContent>
                </Card>

                {/* Banking */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Banking Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                        <p className="font-bold text-green-700">
                          {selectedApplication.collection_method === 'eft' ? '💳 EFT Payment' : '🏦 Debit Order'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {selectedApplication.collection_method === 'eft' 
                            ? 'Member will receive payment notifications and upload proof of payment'
                            : 'Account will be debited automatically each month'
                          }
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Bank</p>
                          <p className="font-medium">{selectedApplication.bank_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Account Holder</p>
                          <p className="font-medium">{selectedApplication.account_holder_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Account Number</p>
                          <p className="font-medium">****{selectedApplication.account_number?.slice(-4) || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Branch Code</p>
                          <p className="font-medium">{selectedApplication.branch_code || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600">{selectedApplication.collection_method === 'eft' ? 'Payment Date' : 'Debit Order Day'}</p>
                          <p className="font-medium">
                            {selectedApplication.collection_method === null || !selectedApplication.debit_order_day
                              ? 'N/A'
                              : `${selectedApplication.debit_order_day}${selectedApplication.debit_order_day === 1 ? 'st' : selectedApplication.debit_order_day === 2 ? 'nd' : selectedApplication.debit_order_day === 3 ? 'rd' : 'th'} of each month`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {/* ID Document */}
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">ID Document</span>
                          <div className="flex gap-2">
                            {selectedApplication.id_document_url ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setShowIdDocument(!showIdDocument)}
                              >
                                {showIdDocument ? 'Hide' : 'Show'}
                              </Button>
                            ) : (
                              <span className="text-sm text-gray-500">Not uploaded</span>
                            )}
                          </div>
                        </div>
                        {showIdDocument && selectedApplication.id_document_url && (
                          <div className="border border-gray-300 rounded bg-white p-2 mt-2">
                            {selectedApplication.id_document_url.toLowerCase().includes('.pdf') ? (
                              <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-3">PDF Document</p>
                                <Button 
                                  size="sm" 
                                  onClick={() => window.open(selectedApplication.id_document_url, '_blank')}
                                >
                                  Open PDF in New Tab
                                </Button>
                              </div>
                            ) : (
                              <img 
                                src={selectedApplication.id_document_url} 
                                alt="ID Document" 
                                className="max-w-full h-auto max-h-96 mx-auto"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">Unable to display image. <a href="' + selectedApplication.id_document_url + '" target="_blank" class="text-blue-600 underline">Click here to open</a></p>';
                                  }
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Proof of Address */}
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Proof of Address</span>
                          <div className="flex gap-2">
                            {(selectedApplication.proof_of_address_url || (selectedApplication.proof_of_address_urls && selectedApplication.proof_of_address_urls.length > 0)) ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setShowProofOfAddress(!showProofOfAddress)}
                              >
                                {showProofOfAddress ? 'Hide' : 'Show'}
                              </Button>
                            ) : (
                              <span className="text-sm text-gray-500">Not uploaded</span>
                            )}
                          </div>
                        </div>
                        {showProofOfAddress && selectedApplication.proof_of_address_url && (
                          <div className="border border-gray-300 rounded bg-white p-2 mt-2">
                            <iframe
                              src={selectedApplication.proof_of_address_url}
                              className="w-full h-96 border-0"
                              title="Proof of Address"
                            />
                            <div className="text-center mt-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => window.open(selectedApplication.proof_of_address_url, '_blank')}
                              >
                                Open in New Tab
                              </Button>
                            </div>
                          </div>
                        )}
                        {showProofOfAddress && selectedApplication.proof_of_address_urls && selectedApplication.proof_of_address_urls.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {selectedApplication.proof_of_address_urls.map((url, idx) => (
                              <div key={idx} className="border border-gray-300 rounded bg-white p-2">
                                <p className="text-xs text-gray-600 mb-1">Document {idx + 1}</p>
                                {url.toLowerCase().includes('.pdf') ? (
                                  <div className="text-center py-8">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-3">PDF Document</p>
                                    <Button 
                                      size="sm" 
                                      onClick={() => window.open(url, '_blank')}
                                    >
                                      Open PDF in New Tab
                                    </Button>
                                  </div>
                                ) : (
                                  <img 
                                    src={url} 
                                    alt={`Proof of Address ${idx + 1}`} 
                                    className="max-w-full h-auto max-h-96 mx-auto"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent) {
                                        parent.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">Unable to display image. <a href="' + url + '" target="_blank" class="text-blue-600 underline">Click here to open</a></p>';
                                      }
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical History */}
                {selectedApplication.medical_history && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        Medical History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-sm">
                        {/* Chronic Medication */}
                        <div>
                          <p className="font-medium text-gray-700">Chronic Medication:</p>
                          <p className="text-gray-600">{selectedApplication.medical_history.chronicMedication === 'yes' ? 'Yes' : 'No'}</p>
                          {selectedApplication.medical_history.chronicMedication === 'yes' && selectedApplication.medical_history.chronicEntries && selectedApplication.medical_history.chronicEntries.length > 0 && (
                            <div className="ml-2 mt-1 space-y-1">
                              {selectedApplication.medical_history.chronicEntries.map((entry: any, idx: number) => (
                                <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                  <p><strong>{entry.person}:</strong> {entry.condition} - {entry.medication}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Other Treatment */}
                        <div>
                          <p className="font-medium text-gray-700">Other Medical Treatment:</p>
                          <p className="text-gray-600">{selectedApplication.medical_history.otherTreatment === 'yes' ? 'Yes' : 'No'}</p>
                          {selectedApplication.medical_history.otherTreatment === 'yes' && selectedApplication.medical_history.otherEntries && selectedApplication.medical_history.otherEntries.length > 0 && (
                            <div className="ml-2 mt-1 space-y-1">
                              {selectedApplication.medical_history.otherEntries.map((entry: any, idx: number) => (
                                <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                  <p><strong>{entry.person}:</strong> {entry.condition} - {entry.medication}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Dental Treatment */}
                        <div>
                          <p className="font-medium text-gray-700">Dental Treatment:</p>
                          <p className="text-gray-600">{selectedApplication.medical_history.dentalTreatment === 'yes' ? 'Yes' : 'No'}</p>
                          {selectedApplication.medical_history.dentalTreatment === 'yes' && selectedApplication.medical_history.dentalEntries && selectedApplication.medical_history.dentalEntries.length > 0 && (
                            <div className="ml-2 mt-1 space-y-1">
                              {selectedApplication.medical_history.dentalEntries.map((entry: any, idx: number) => (
                                <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                  <p><strong>{entry.person}:</strong> {entry.condition} - {entry.medication}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Future Concerns */}
                        <div>
                          <p className="font-medium text-gray-700">Future Medical Concerns:</p>
                          <p className="text-gray-600">{selectedApplication.medical_history.futureConcerns === 'yes' ? 'Yes' : 'No'}</p>
                          {selectedApplication.medical_history.futureConcerns === 'yes' && selectedApplication.medical_history.futureEntries && selectedApplication.medical_history.futureEntries.length > 0 && (
                            <div className="ml-2 mt-1 space-y-1">
                              {selectedApplication.medical_history.futureEntries.map((entry: any, idx: number) => (
                                <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                  <p><strong>{entry.person}:</strong> {entry.condition} - {entry.medication}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Pregnancy */}
                        <div>
                          <p className="font-medium text-gray-700">Pregnancy:</p>
                          <p className="text-gray-600">{selectedApplication.medical_history.pregnancy === 'yes' ? 'Yes' : 'No'}</p>
                          {selectedApplication.medical_history.pregnancy === 'yes' && selectedApplication.medical_history.pregnancyEntries && selectedApplication.medical_history.pregnancyEntries.length > 0 && (
                            <div className="ml-2 mt-1 space-y-1">
                              {selectedApplication.medical_history.pregnancyEntries.map((entry: any, idx: number) => (
                                <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                  <p><strong>{entry.person}:</strong> Due Date: {entry.dueDate}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Major Operations */}
                        <div>
                          <p className="font-medium text-gray-700">Major Operations (past 5 years):</p>
                          <p className="text-gray-600">{selectedApplication.medical_history.majorOperations === 'yes' ? 'Yes' : 'No'}</p>
                          {selectedApplication.medical_history.majorOperations === 'yes' && selectedApplication.medical_history.operationEntries && selectedApplication.medical_history.operationEntries.length > 0 && (
                            <div className="ml-2 mt-1 space-y-1">
                              {selectedApplication.medical_history.operationEntries.map((entry: any, idx: number) => (
                                <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                  <p><strong>{entry.person}:</strong> {entry.procedure} ({entry.date})</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Hospital Admissions */}
                        <div>
                          <p className="font-medium text-gray-700">Hospital Admissions (past 5 years):</p>
                          <p className="text-gray-600">{selectedApplication.medical_history.hospitalAdmissions === 'yes' ? 'Yes' : 'No'}</p>
                          {selectedApplication.medical_history.hospitalAdmissions === 'yes' && selectedApplication.medical_history.hospitalEntries && selectedApplication.medical_history.hospitalEntries.length > 0 && (
                            <div className="ml-2 mt-1 space-y-1">
                              {selectedApplication.medical_history.hospitalEntries.map((entry: any, idx: number) => (
                                <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                  <p><strong>{entry.person}:</strong> {entry.reason} ({entry.date})</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Medical Aid Membership */}
                        <div>
                          <p className="font-medium text-gray-700">Medical Aid/Hospital Plan Member:</p>
                          <p className="text-gray-600">{selectedApplication.medical_history.medicalAidMember === 'yes' ? 'Yes' : 'No'}</p>
                          {selectedApplication.medical_history.medicalAidMember === 'yes' && selectedApplication.medical_history.medicalAidEntries && selectedApplication.medical_history.medicalAidEntries.length > 0 && (
                            <div className="ml-2 mt-1 space-y-1">
                              {selectedApplication.medical_history.medicalAidEntries.map((entry: any, idx: number) => (
                                <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                  <p><strong>{entry.person}:</strong> {entry.schemeName} (since {entry.inceptionDate})</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Voice Recording & Digital Signature */}
                <Card>
                  <CardHeader>
                    <CardTitle>Terms Acceptance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Voice Recording */}
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium mb-2">Voice Recording</p>
                        {selectedApplication.voice_recording_url ? (
                          <div className="space-y-2">
                            <audio controls className="w-full" preload="metadata">
                              <source src={selectedApplication.voice_recording_url} />
                              Your browser does not support the audio element.
                            </audio>
                            <p className="text-xs text-gray-600">
                              Recorded: {selectedApplication.terms_accepted_at ? new Date(selectedApplication.terms_accepted_at).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No voice recording</span>
                        )}
                      </div>

                      {/* Digital Signature */}
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium mb-2">Digital Signature</p>
                        {selectedApplication.signature_url ? (
                          <div className="space-y-2">
                            <div className="border border-gray-300 rounded bg-white p-2">
                              <img 
                                src={selectedApplication.signature_url} 
                                alt="Digital Signature" 
                                className="max-h-24 mx-auto"
                              />
                            </div>
                            <p className="text-xs text-gray-600">
                              Signed: {selectedApplication.terms_accepted_at ? new Date(selectedApplication.terms_accepted_at).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No signature</span>
                        )}
                      </div>

                      {/* Marketing Consent */}
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm font-medium mb-2">Marketing Consent</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-700">
                            {selectedApplication.marketing_consent ? '✓ Opted in for marketing communications' : '✗ Not opted in'}
                          </p>
                          {selectedApplication.marketing_consent && (
                            <>
                              <p className="text-gray-600">• Email: {selectedApplication.email_consent ? 'Yes' : 'No'}</p>
                              <p className="text-gray-600">• SMS: {selectedApplication.sms_consent ? 'Yes' : 'No'}</p>
                              <p className="text-gray-600">• Phone: {selectedApplication.phone_consent ? 'Yes' : 'No'}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Call Centre Verification Info */}
                {selectedApplication.status === 'under_review' && selectedApplication.review_notes && (
                  <Card className="border-2 border-green-500 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        Call Centre Verification
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <p className="text-sm font-medium text-green-800 mb-2">✓ This application has been verified by call centre</p>
                        
                        {/* Verification Notes */}
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Verification Notes:</p>
                          <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 whitespace-pre-wrap">
                            {selectedApplication.review_notes}
                          </div>
                        </div>

                        {/* Call Recording */}
                        {selectedApplication.review_notes.includes('Call Recording:') && (() => {
                          const recordingUrl = selectedApplication.review_notes.split('Call Recording: ')[1]?.split('\n')[0]?.trim();
                          // Create a signed URL for Supabase storage
                          const publicUrl = recordingUrl?.includes('supabase.co/storage') 
                            ? recordingUrl.replace('/object/public/', '/object/sign/') 
                            : recordingUrl;
                          
                          return (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-2">Call Recording:</p>
                              {recordingUrl ? (
                                <>
                                  <audio 
                                    controls 
                                    className="w-full" 
                                    preload="metadata"
                                    src={recordingUrl}
                                    onError={(e) => {
                                      console.error('Audio load error:', e);
                                      console.log('Recording URL:', recordingUrl);
                                    }}
                                  >
                                    Your browser does not support the audio element.
                                  </audio>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-2"
                                    onClick={() => window.open(recordingUrl, '_blank')}
                                  >
                                    <Play className="w-3 h-3 mr-1" />
                                    Open Recording in New Tab
                                  </Button>
                                </>
                              ) : (
                                <p className="text-sm text-gray-500">Recording URL not found</p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Please review the verification notes and call recording before approving or rejecting this application.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Review Actions */}
                {(selectedApplication.status === 'submitted' || selectedApplication.status === 'under_review') && (
                  <Card className="border-2 border-blue-500">
                    <CardHeader>
                      <CardTitle>Review Member Application</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Review Notes</label>
                        <textarea
                          className="w-full px-3 py-2 border rounded-md"
                          rows={3}
                          placeholder="Add notes about this application..."
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                        <textarea
                          className="w-full px-3 py-2 border rounded-md"
                          rows={2}
                          placeholder="Reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                          disabled={processing}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Application
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 text-red-600 hover:bg-red-50"
                          onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                          disabled={processing || !rejectionReason}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Application
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Status Badge */}
                <div className="flex items-center justify-center">
                  {getStatusBadge(selectedApplication.status)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
