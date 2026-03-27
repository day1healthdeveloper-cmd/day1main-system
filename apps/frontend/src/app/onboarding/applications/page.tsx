'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, MapPin, FileText, CreditCard, Users, Phone, Mail, Calendar, X, Heart } from 'lucide-react'

interface Application {
  id: string
  application_number: string
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
  plan_config: string
  monthly_price: number
  bank_name: string
  account_number: string
  branch_code: string
  account_holder_name: string
  debit_order_day: number
  status: string
  submitted_at: string
  id_document_url?: string
  proof_of_address_url?: string
  proof_of_address_urls?: string[]
  selfie_url?: string
  voice_recording_url?: string
  signature_url?: string
  terms_accepted_at?: string
  medical_history?: any
  dependents?: any[]
  collection_method?: string
  marketing_consent?: boolean
  email_consent?: boolean
  sms_consent?: boolean
  phone_consent?: boolean
}

export default function OnboardingApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showIdDocument, setShowIdDocument] = useState(false)
  const [showProofOfAddress, setShowProofOfAddress] = useState(false)

  useEffect(() => {
    fetchApplications()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('applications-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
        fetchApplications()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p>Loading applications...</p></div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Onboarding Dashboard</h1>
        <p className="text-gray-600">Review and validate new member applications</p>
      </div>

      {/* Applications List */}
      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold">{app.first_name} {app.last_name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{app.application_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{app.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{app.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(app.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setSelectedApplication(app)
                    setShowDetails(true)
                  }}
                  variant="outline"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {applications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No applications found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Application Details Modal */}
      {showDetails && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Member Application Details</h2>
                <p className="text-gray-600">{selectedApplication.application_number}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDetails(false)
                  setShowIdDocument(false)
                  setShowProofOfAddress(false)
                }}
              >
                Close
              </Button>
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
                      {selectedApplication.dependents.map((dep: any, idx: number) => (
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
                        <p className="font-medium">{selectedApplication.debit_order_day}{selectedApplication.debit_order_day === 1 ? 'st' : selectedApplication.debit_order_day === 2 ? 'nd' : selectedApplication.debit_order_day === 3 ? 'rd' : 'th'} of each month</p>
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
                          <iframe
                            src={selectedApplication.id_document_url}
                            className="w-full h-96 border-0"
                            title="ID Document"
                          />
                          <div className="text-center mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(selectedApplication.id_document_url, '_blank')}
                            >
                              Open in New Tab
                            </Button>
                          </div>
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
                          {selectedApplication.proof_of_address_urls.map((url: string, idx: number) => (
                            <div key={idx} className="border border-gray-300 rounded bg-white p-2">
                              <p className="text-xs text-gray-600 mb-1">Document {idx + 1}</p>
                              <iframe
                                src={url}
                                className="w-full h-96 border-0"
                                title={`Proof of Address ${idx + 1}`}
                              />
                              <div className="text-center mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(url, '_blank')}
                                >
                                  Open in New Tab
                                </Button>
                              </div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
