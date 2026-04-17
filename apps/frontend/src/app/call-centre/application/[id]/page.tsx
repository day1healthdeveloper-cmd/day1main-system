'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, MapPin, FileText, Users, CreditCard, CheckCircle, Phone, Mic, Square, Play, Upload } from 'lucide-react';

interface Application {
  id: string;
  application_number: string;
  first_name: string;
  last_name: string;
  id_number: string;
  date_of_birth: string;
  gender: string;
  email: string;
  mobile: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postal_code: string;
  plan_name: string;
  monthly_price: number;
  status: string;
  submitted_at: string;
  dependents: any[];
  id_document_url: string;
  proof_of_address_url: string;
  bank_name: string;
  account_number: string;
  branch_code: string;
  account_holder_name: string;
  debit_order_day: number;
  collection_method: string;
  medical_history: any;
}

export default function CallCentreApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading, isAuthenticated } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  
  // Document collapse states
  const [idDocExpanded, setIdDocExpanded] = useState(false);
  const [proofAddressExpanded, setProofAddressExpanded] = useState(false);
  
  // Call recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadedRecordingUrl, setUploadedRecordingUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && !user.roles.includes('call_centre_agent')) {
      router.push('/dashboard');
      return;
    }

    if (user && params.id) {
      loadApplication();
    }
  }, [loading, isAuthenticated, user, router, params.id]);

  const loadApplication = async () => {
    setLoadingApp(true);
    try {
      const response = await fetch('/api/admin/applications');
      
      if (!response.ok) throw new Error('Failed to fetch applications');
      
      const data = await response.json();
      const app = data.applications?.find((a: Application) => a.id === params.id);
      
      if (app) {
        setApplication(app);
      } else {
        alert('Application not found');
        router.push('/call-centre/support');
      }
    } catch (error) {
      console.error('Error loading application:', error);
      alert('Failed to load application');
      router.push('/call-centre/support');
    } finally {
      setLoadingApp(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Unable to access microphone. Please check permissions.');
      console.error('Microphone error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const uploadRecording = async () => {
    if (!audioBlob) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, `call-recording-${application?.application_number}-${Date.now()}.webm`);
      formData.append('bucket', 'call-recordings');
      formData.append('folder', 'verification-calls');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setUploadedRecordingUrl(data.url);
      alert('Recording uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload recording');
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (!verificationNotes.trim()) {
      alert('Please add verification notes');
      return;
    }

    if (!uploadedRecordingUrl) {
      alert('Please record and upload the verification call first');
      return;
    }

    if (!confirm('Mark this application as verified and ready for admin approval?')) {
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application?.id,
          status: 'under_review',
          reviewNotes: `VERIFIED BY CALL CENTRE: ${verificationNotes}\n\nCall Recording: ${uploadedRecordingUrl}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to verify application');
      
      alert('Application verified! Admin will be notified for final approval.');
      router.push('/call-centre/support');
    } catch (error) {
      console.error('Error verifying application:', error);
      alert('Failed to verify application');
    } finally {
      setVerifying(false);
    }
  };

  if (loading || loadingApp || !application) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-96">
          <p>Loading application...</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
            <p className="text-gray-600">{application.application_number}</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/call-centre/support')}>
            Back to Applications
          </Button>
        </div>

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
                <p className="font-medium">{application.first_name} {application.last_name}</p>
              </div>
              <div>
                <p className="text-gray-600">ID Number</p>
                <p className="font-medium">{application.id_number}</p>
              </div>
              <div>
                <p className="text-gray-600">Date of Birth</p>
                <p className="font-medium">{new Date(application.date_of_birth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Gender</p>
                <p className="font-medium">{application.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{application.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Mobile</p>
                <p className="font-medium flex items-center gap-2">
                  {application.mobile}
                  <a href={`tel:${application.mobile}`} className="text-blue-600 hover:text-blue-700">
                    <Phone className="w-4 h-4" />
                  </a>
                </p>
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
              <p>{application.address_line1}</p>
              {application.address_line2 && <p>{application.address_line2}</p>}
              <p>{application.city}, {application.postal_code}</p>
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
                <p className="font-medium">{application.plan_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Monthly Premium</p>
                <p className="font-medium text-lg">R{application.monthly_price?.toFixed(2) || '0.00'}</p>
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
            {application.dependents && application.dependents.length > 0 ? (
              <div className="space-y-3">
                {application.dependents.map((dep, idx) => (
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
                  {application.collection_method === 'eft' ? '💳 EFT Payment' : '🏦 Debit Order'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Bank</p>
                  <p className="font-medium">{application.bank_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Account Holder</p>
                  <p className="font-medium">{application.account_holder_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Account Number</p>
                  <p className="font-medium">****{application.account_number?.slice(-4) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Debit Order Day</p>
                  <p className="font-medium">{application.debit_order_day}th of each month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* ID Document */}
              {application.id_document_url ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-900">ID Document</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIdDocExpanded(!idDocExpanded)}
                      className="text-xs"
                    >
                      {idDocExpanded ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>
                  <div className="border-2 border-blue-200 rounded-lg overflow-hidden bg-white">
                    <iframe
                      src={application.id_document_url}
                      className={`w-full transition-all duration-300 ${idDocExpanded ? 'h-[800px]' : 'h-[300px]'}`}
                      title="ID Document"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500">No ID document uploaded</p>
                </div>
              )}
              
              {/* Proof of Address */}
              {application.proof_of_address_url ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-green-900">Proof of Address</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setProofAddressExpanded(!proofAddressExpanded)}
                      className="text-xs"
                    >
                      {proofAddressExpanded ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>
                  <div className="border-2 border-green-200 rounded-lg overflow-hidden bg-white">
                    <iframe
                      src={application.proof_of_address_url}
                      className={`w-full transition-all duration-300 ${proofAddressExpanded ? 'h-[800px]' : 'h-[300px]'}`}
                      title="Proof of Address"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500">No proof of address uploaded</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verification Section */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Verification Call Recording
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Recording Controls */}
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium mb-3">Call Recording</h3>
                
                {!isRecording && !audioBlob && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Start recording before calling the member to verify their details
                    </p>
                    <Button
                      onClick={startRecording}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </Button>
                  </div>
                )}

                {isRecording && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                      <span className="text-lg font-bold text-red-600">
                        Recording: {formatTime(recordingTime)}
                      </span>
                    </div>
                    <Button
                      onClick={stopRecording}
                      className="w-full bg-gray-800 hover:bg-gray-900"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                )}

                {audioBlob && !uploadedRecordingUrl && (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-sm font-medium text-green-800 mb-2">
                        ✓ Recording Complete ({formatTime(recordingTime)})
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (audioUrl) {
                              const audio = new Audio(audioUrl);
                              audio.play();
                            }
                          }}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Play
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAudioBlob(null);
                            setAudioUrl(null);
                            setRecordingTime(0);
                          }}
                        >
                          Re-record
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={uploadRecording}
                      disabled={uploading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Recording'}
                    </Button>
                  </div>
                )}

                {uploadedRecordingUrl && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm font-medium text-green-800 mb-2">
                      ✓ Recording Uploaded Successfully
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(uploadedRecordingUrl, '_blank')}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Listen to Recording
                    </Button>
                  </div>
                )}
              </div>

              {/* Verification Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Verification Notes</label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add notes about your call with the member (e.g., confirmed details, member verified identity, etc.)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleVerify}
                disabled={verifying || !verificationNotes.trim() || !uploadedRecordingUrl}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {verifying ? 'Verifying...' : 'Mark as Verified & Send to Admin'}
              </Button>
              
              {!uploadedRecordingUrl && (
                <p className="text-xs text-gray-500 text-center">
                  Please record and upload the verification call before submitting
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
