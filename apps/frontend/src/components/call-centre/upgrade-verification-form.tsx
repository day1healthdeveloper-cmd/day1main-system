'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Play, Upload, Mic, Square } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface UpgradeVerificationFormProps {
  upgradeRequest: {
    id: string;
    mobile_number: string;
    member_first_name?: string;
    member_last_name?: string;
    current_plan: string;
    upgraded_plan: string;
    current_price?: number;
    upgraded_price?: number;
    status: string;
    verification_notes?: string;
    call_recording_url?: string;
    verified_at?: string;
    verified_by?: string;
    // Full member details
    member?: {
      member_number: string;
      id_number: string;
      date_of_birth: string;
      gender: string;
      address_line1: string;
      address_line2?: string;
      city: string;
      postal_code: string;
      plan_name: string;
      monthly_premium: number;
      status: string;
      start_date: string;
      broker_code: string;
    };
    // Claims history
    claims?: Array<{
      id: string;
      claim_number: string;
      submission_date: string;
      service_date: string;
      claim_type: string;
      status: string;
      claimed_amount: string;
      provider_id: string;
    }>;
    // Plan benefits
    currentPlanBenefits?: Array<{
      title: string;
      content: string;
      display_order: number;
    }>;
    upgradedPlanBenefits?: Array<{
      title: string;
      content: string;
      display_order: number;
    }>;
  };
  onVerify: (notes: string, recordingUrl: string) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  userRole?: string; // Add user role to determine what actions are available
}

export function UpgradeVerificationForm({ upgradeRequest, onVerify, onReject, userRole }: UpgradeVerificationFormProps) {
  const { addToast } = useToast();
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  
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
      addToast({
        type: 'error',
        title: 'Microphone Access Denied',
        description: 'Unable to access microphone. Please check permissions.',
        duration: 5000,
      });
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
      formData.append('file', audioBlob, `upgrade-call-${upgradeRequest.id}-${Date.now()}.webm`);
      formData.append('bucket', 'call-recordings');
      formData.append('folder', 'upgrade-verification-calls');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setUploadedRecordingUrl(data.url);
      
      addToast({
        type: 'success',
        title: 'Recording Uploaded',
        description: 'Call recording uploaded successfully!',
        duration: 3000,
      });
    } catch (error) {
      console.error('Upload error:', error);
      addToast({
        type: 'error',
        title: 'Upload Failed',
        description: 'Failed to upload recording. Please try again.',
        duration: 5000,
      });
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
      addToast({
        type: 'error',
        title: 'Verification Notes Required',
        description: 'Please add verification notes before verifying the upgrade request.',
        duration: 3000,
      });
      return;
    }

    if (!uploadedRecordingUrl) {
      addToast({
        type: 'error',
        title: 'Call Recording Required',
        description: 'Please record and upload the verification call before proceeding.',
        duration: 5000,
      });
      return;
    }

    setProcessing(true);
    try {
      await onVerify(verificationNotes, uploadedRecordingUrl);
      
      addToast({
        type: 'success',
        title: 'Upgrade Verified',
        description: 'The upgrade request has been verified and is ready for approval.',
        duration: 5000,
      });
      
      // Reset form
      setVerificationNotes('');
      setAudioBlob(null);
      setAudioUrl(null);
      setUploadedRecordingUrl(null);
    } catch (error) {
      console.error('Verification failed:', error);
      addToast({
        type: 'error',
        title: 'Verification Failed',
        description: 'Failed to verify upgrade request. Please try again.',
        duration: 5000,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      addToast({
        type: 'error',
        title: 'Rejection Reason Required',
        description: 'Please provide a rejection reason.',
        duration: 3000,
      });
      return;
    }

    setProcessing(true);
    try {
      await onReject(rejectionReason);
      
      addToast({
        type: 'success',
        title: 'Upgrade Rejected',
        description: 'The upgrade request has been rejected.',
        duration: 5000,
      });
      
      setRejectionReason('');
    } catch (error) {
      console.error('Rejection failed:', error);
      addToast({
        type: 'error',
        title: 'Rejection Failed',
        description: 'Failed to reject upgrade request. Please try again.',
        duration: 5000,
      });
    } finally {
      setProcessing(false);
    }
  };

  // If already verified, show verification details
  if (upgradeRequest.status === 'verified') {
    return (
      <Card className="border-2 border-green-500 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            Upgrade Verification Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <p className="text-sm font-medium text-green-800 mb-2">
              ✓ This upgrade request has been verified by call centre
            </p>
            
            {/* Verification Details */}
            <div className="space-y-3 mt-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Verified By:</p>
                <p className="text-sm text-gray-600">{upgradeRequest.verified_by || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Verified At:</p>
                <p className="text-sm text-gray-600">
                  {upgradeRequest.verified_at 
                    ? new Date(upgradeRequest.verified_at).toLocaleString() 
                    : 'N/A'}
                </p>
              </div>

              {/* Verified Checklist Items */}
              <div className="pt-3 border-t border-green-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Verified Information:</p>
                <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">✓ Member ID Number:</span>
                    <span className="font-semibold text-blue-600">
                      {upgradeRequest.member?.id_number || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">✓ Current Plan:</span>
                    <span className="font-semibold text-blue-600">
                      {upgradeRequest.current_plan}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">✓ Upgraded Plan:</span>
                    <span className="font-semibold text-blue-600">
                      {upgradeRequest.upgraded_plan}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">✓ Current Premium:</span>
                    <span className="font-semibold text-blue-600">
                      R{upgradeRequest.current_price?.toFixed(2)}/month
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">✓ New Premium:</span>
                    <span className="font-semibold text-blue-600">
                      R{upgradeRequest.upgraded_price?.toFixed(2)}/month
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Premium Increase:</span>
                    <span className="font-bold text-orange-600">
                      +R{((upgradeRequest.upgraded_price || 0) - (upgradeRequest.current_price || 0)).toFixed(2)}/month
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Notes */}
              {upgradeRequest.verification_notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Verification Notes:</p>
                  <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {upgradeRequest.verification_notes}
                  </div>
                </div>
              )}

              {/* Call Recording */}
              {upgradeRequest.call_recording_url && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Call Recording:</p>
                  <audio 
                    controls 
                    className="w-full" 
                    preload="metadata"
                    src={upgradeRequest.call_recording_url}
                  >
                    Your browser does not support the audio element.
                  </audio>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => window.open(upgradeRequest.call_recording_url, '_blank')}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Open Recording in New Tab
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              ℹ️ This upgrade request has been verified and is ready for operations manager approval.
            </p>
          </div>

          {/* Operations Manager Approval Buttons - Only show for operations_manager role */}
          {userRole === 'operations_manager' && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={async () => {
                  if (!confirm('Approve this upgrade request? The member\'s plan will be updated.')) {
                    return;
                  }
                  setProcessing(true);
                  try {
                    const response = await fetch(`/api/plus1/upgrade-requests/${upgradeRequest.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'approve' }),
                    });

                    if (!response.ok) throw new Error('Failed to approve upgrade');

                    addToast({
                      type: 'success',
                      title: 'Upgrade Approved',
                      description: 'The member\'s plan has been upgraded successfully.',
                      duration: 5000,
                    });

                    // Reload page or redirect
                    window.location.reload();
                  } catch (error) {
                    console.error('Approval failed:', error);
                    addToast({
                      type: 'error',
                      title: 'Approval Failed',
                      description: 'Failed to approve upgrade. Please try again.',
                      duration: 5000,
                    });
                  } finally {
                    setProcessing(false);
                  }
                }}
                disabled={processing}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Upgrade
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-red-600 hover:bg-red-50"
                onClick={async () => {
                  const reason = prompt('Enter rejection reason:');
                  if (!reason) return;

                  setProcessing(true);
                  try {
                    const response = await fetch(`/api/plus1/upgrade-requests/${upgradeRequest.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        action: 'reject',
                        rejection_reason: reason 
                      }),
                    });

                    if (!response.ok) throw new Error('Failed to reject upgrade');

                    addToast({
                      type: 'success',
                      title: 'Upgrade Rejected',
                      description: 'The upgrade request has been rejected.',
                      duration: 5000,
                    });

                    // Reload page or redirect
                    window.location.reload();
                  } catch (error) {
                    console.error('Rejection failed:', error);
                    addToast({
                      type: 'error',
                      title: 'Rejection Failed',
                      description: 'Failed to reject upgrade. Please try again.',
                      duration: 5000,
                    });
                  } finally {
                    setProcessing(false);
                  }
                }}
                disabled={processing}
              >
                Reject Upgrade
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show verification form for pending requests
  return (
    <Card className="border-2 border-blue-500">
      <CardHeader>
        <CardTitle>Upgrade Verification</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Verify member upgrade request via phone call
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Member Information Card */}
        {upgradeRequest.member && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base">Member Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Member Number</p>
                  <p className="font-medium">{upgradeRequest.member.member_number}</p>
                </div>
                <div>
                  <p className="text-gray-600">ID Number</p>
                  <p className="font-medium">{upgradeRequest.member.id_number}</p>
                </div>
                <div>
                  <p className="text-gray-600">Date of Birth</p>
                  <p className="font-medium">
                    {new Date(upgradeRequest.member.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Gender</p>
                  <p className="font-medium capitalize">{upgradeRequest.member.gender}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Address</p>
                  <p className="font-medium">
                    {upgradeRequest.member.address_line1}
                    {upgradeRequest.member.address_line2 && `, ${upgradeRequest.member.address_line2}`}
                    <br />
                    {upgradeRequest.member.city}, {upgradeRequest.member.postal_code}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Current Plan</p>
                  <p className="font-medium">{upgradeRequest.member.plan_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Current Premium</p>
                  <p className="font-medium">R{upgradeRequest.member.monthly_premium?.toFixed(2)}/month</p>
                </div>
                <div>
                  <p className="text-gray-600">Member Status</p>
                  <p className="font-medium capitalize">{upgradeRequest.member.status}</p>
                </div>
                <div>
                  <p className="text-gray-600">Member Since</p>
                  <p className="font-medium">
                    {new Date(upgradeRequest.member.start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upgrade Summary */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-base">Upgrade Request Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">From</p>
                  <p className="font-medium">{upgradeRequest.current_plan}</p>
                  <p className="text-sm text-gray-600">R{upgradeRequest.current_price?.toFixed(2)}/month</p>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div>
                  <p className="text-sm text-gray-600">To</p>
                  <p className="font-medium text-blue-600">{upgradeRequest.upgraded_plan}</p>
                  <p className="text-sm text-blue-600">R{upgradeRequest.upgraded_price?.toFixed(2)}/month</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">Premium Increase</p>
                <p className="text-lg font-bold text-orange-600">
                  +R{((upgradeRequest.upgraded_price || 0) - (upgradeRequest.current_price || 0)).toFixed(2)}/month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call Recording - REQUIRED - MOVED BEFORE CHECKLIST */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-red-600">Call Recording (Required) *</label>
          
          {!audioBlob && !uploadedRecordingUrl && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">
                  ⚠️ Call recording is required. Start recording before proceeding.
                </p>
              </div>
              
              <div className="flex gap-2">
                {!isRecording ? (
                  <Button
                    type="button"
                    onClick={startRecording}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording Call
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={stopRecording}
                    className="flex-1 bg-red-600 hover:bg-red-700 animate-pulse"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording ({formatTime(recordingTime)})
                  </Button>
                )}
              </div>
            </div>
          )}

          {audioBlob && !uploadedRecordingUrl && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-sm text-green-800 mb-2">
                  ✓ Call recorded successfully ({formatTime(recordingTime)})
                </p>
                <audio controls className="w-full" src={audioUrl || undefined}>
                  Your browser does not support the audio element.
                </audio>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={uploadRecording}
                  disabled={uploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Recording'}
                </Button>
                <Button
                  type="button"
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
          )}

          {uploadedRecordingUrl && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm text-green-800 mb-2">
                ✓ Call recording uploaded successfully
              </p>
              <audio controls className="w-full" src={uploadedRecordingUrl}>
                Your browser does not support the audio element.
              </audio>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => {
                  setUploadedRecordingUrl(null);
                  setAudioBlob(null);
                  setAudioUrl(null);
                }}
              >
                Record New Call
              </Button>
            </div>
          )}
        </div>

        {/* Verification Checklist */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-sm font-medium text-yellow-900 mb-3">
            Verification Checklist:
          </p>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li className="flex items-start justify-between gap-4">
              <span>• Confirm member identity (ID number)</span>
              <span className="font-semibold text-blue-600 text-right">
                {upgradeRequest.member?.id_number || 'Loading...'}
              </span>
            </li>
            <li className="flex items-start justify-between gap-4">
              <span>• Verify current plan details</span>
              <span className="font-semibold text-blue-600 text-right">
                {upgradeRequest.current_plan}
              </span>
            </li>
            <li className="flex items-start justify-between gap-4">
              <span>• Explain new plan benefits and coverage</span>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 shrink-0"
                onClick={() => {
                  // Find the brochure file name based on plan name
                  const planBrochures: Record<string, string> = {
                    // Plus1 Upgrade Plans
                    'Day-to-Day Plan': 'Day-To-Day Single Plan .pdf',
                    'Hospital Value Plus': 'Hospital Value Plus Plan.pdf',
                    'Comprehensive - Value Plus': 'Comprehensive Value Plus Plan.pdf',
                    // Standard Plans
                    'Day to Day Single': 'Day-To-Day Single Plan .pdf',
                    'Day to Day Couple': 'Day-To-Day Single Plan .pdf',
                    'Day to Day Family': 'Day-To-Day Single Plan .pdf',
                    'Comprehensive Value Plus Plan Single': 'Comprehensive Value Plus Plan.pdf',
                    'Comprehensive Value Plus Plan Couple': 'Comprehensive Value Plus Plan.pdf',
                    'Comprehensive Value Plus Plan Family': 'Comprehensive Value Plus Plan.pdf',
                    'Platinum Plan Single': 'Comprehensive Platinum Plan.pdf',
                    'Platinum Plan Couple': 'Comprehensive Platinum Plan.pdf',
                    'Platinum Plan Family': 'Comprehensive Platinum Plan.pdf',
                    'Platinum Hospital Plan Single': 'Hospital Platinum Plan.pdf',
                    'Platinum Hospital Plan Couple': 'Hospital Platinum Plan.pdf',
                    'Platinum Hospital Plan Family': 'Hospital Platinum Plan.pdf',
                    'Executive Plan Single': 'Comprehensive Executive Plan.pdf',
                    'Executive Plan Couple': 'Comprehensive Executive Plan.pdf',
                    'Executive Plan Family': 'Comprehensive Executive Plan.pdf',
                    'Executive Hospital Plan Single': 'Hospital Executive Plan.pdf',
                    'Executive Hospital Plan Couple': 'Hospital Executive Plan.pdf',
                    'Executive Hospital Plan Family': 'Hospital Executive Plan.pdf',
                    'Senior Comprehensive Plan': 'Senior Comprehensive Plan.pdf',
                    'Senior Day-to-Day Plan': 'Senior Day-To-Day Plan.pdf',
                    'Senior Hospital Plan': 'Senior Hospital Plan.pdf',
                    'Value Plus Senior Hospital Plan': 'Senior Hospital Plan.pdf',
                  };
                  
                  const brochureFileName = planBrochures[upgradeRequest.upgraded_plan];
                  if (brochureFileName) {
                    window.open(`/api/brochure?file=${encodeURIComponent(brochureFileName)}`, '_blank');
                  } else {
                    addToast({
                      type: 'error',
                      title: 'Brochure Not Found',
                      description: 'Plan brochure is not available.',
                      duration: 3000,
                    });
                  }
                }}
              >
                View Brochure
              </Button>
            </li>
            <li className="flex items-start gap-2">
              <span>• Confirm member understands waiting periods (if any)</span>
            </li>
            <li className="flex items-start justify-between gap-4">
              <span>• Confirm new monthly premium amount</span>
              <span className="font-semibold text-blue-600 text-right">
                R{upgradeRequest.upgraded_price?.toFixed(2)}/month
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>• Check recent claim history</span>
            </li>
          </ul>
        </div>

        {/* Verification Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Verification Notes *</label>
          <textarea
            className="w-full px-3 py-2 border rounded-md"
            rows={6}
            placeholder="Document the verification call:
- Member confirmed identity
- Explained new plan benefits
- Confirmed premium increase from R___ to R___
- Reviewed claim history: ___
- Member verbally consented to upgrade
- Additional notes: ___"
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleVerify}
            disabled={processing || !verificationNotes.trim() || !uploadedRecordingUrl}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Verify Upgrade Request
          </Button>
        </div>

        {/* Rejection Section */}
        <div className="pt-4 border-t space-y-3">
          <p className="text-sm font-medium text-gray-700">Or Reject Upgrade Request:</p>
          <div className="space-y-2">
            <textarea
              className="w-full px-3 py-2 border rounded-md"
              rows={2}
              placeholder="Reason for rejection (e.g., member declined, payment issues, etc.)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="w-full text-red-600 hover:bg-red-50"
            onClick={handleReject}
            disabled={processing || !rejectionReason.trim()}
          >
            Reject Upgrade Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

