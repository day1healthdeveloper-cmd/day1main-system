'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Download
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
  selfie_url: string
  bank_name: string
  account_number: string
  medical_history: any
  marketing_consent: boolean
  review_notes: string
  rejection_reason: string
  voice_recording_url?: string
  terms_accepted_at?: string
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

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

      if (response.ok) {
        alert(`Application ${newStatus} successfully!`);
        setShowDetails(false);
        setReviewNotes('');
        setRejectionReason('');
        fetchApplications();
      } else {
        alert('Failed to update application');
      }
    } catch (error) {
      console.error('Failed to update application:', error);
      alert('Failed to update application');
    } finally {
      setProcessing(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id_number.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
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
                <Input 
                  placeholder="Application number, name, email, ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Statuses</option>
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
                        <p className="text-gray-600">Dependents</p>
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
                      {app.status === 'submitted' && (
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
                <Button variant="outline" onClick={() => setShowDetails(false)}>Close</Button>
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

                {/* Dependents */}
                {selectedApplication.dependents && selectedApplication.dependents.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Dependents ({selectedApplication.dependents.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedApplication.dependents.map((dep, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded">
                            <p className="font-medium">{dep.first_name} {dep.last_name}</p>
                            <p className="text-sm text-gray-600">{dep.relationship} • DOB: {new Date(dep.date_of_birth).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Banking */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Banking Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Bank</p>
                        <p className="font-medium">{selectedApplication.bank_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Account Number</p>
                        <p className="font-medium">****{selectedApplication.account_number?.slice(-4) || 'N/A'}</p>
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
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">ID Document</span>
                        {selectedApplication.id_document_url ? (
                          <Button size="sm" variant="outline">View</Button>
                        ) : (
                          <span className="text-sm text-gray-500">Not uploaded</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Proof of Address</span>
                        {selectedApplication.proof_of_address_url ? (
                          <Button size="sm" variant="outline">View</Button>
                        ) : (
                          <span className="text-sm text-gray-500">Not uploaded</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Selfie</span>
                        {selectedApplication.selfie_url ? (
                          <Button size="sm" variant="outline">View</Button>
                        ) : (
                          <span className="text-sm text-gray-500">Not uploaded</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                            <audio controls className="w-full">
                              <source src={selectedApplication.voice_recording_url} type="audio/webm" />
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

                {/* Review Actions */}
                {selectedApplication.status === 'submitted' && (
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
