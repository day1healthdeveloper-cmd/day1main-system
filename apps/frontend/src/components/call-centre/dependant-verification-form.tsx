'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Play, Upload, Mic, Square } from 'lucide-react'

interface DependantRequest {
  id: string
  mobile_number: string
  member_first_name: string
  member_last_name: string
  member_email: string
  member_plan_name?: string
  dependant_first_name: string
  dependant_last_name: string
  dependant_id_number: string
  dependant_date_of_birth: string
  dependant_gender: string
  dependant_relationship: string
  id_document_url: string | null
  current_premium: number
  dependant_cost: number
  new_premium: number
  status: string
  verification_notes: string | null
  call_recording_url: string | null
  verified_at: string | null
  verified_by: string | null
}

interface Props {
  request: DependantRequest
  userRole: string
  onClose: () => void
  onSuccess: () => void
}

export default function DependantVerificationForm({ request, userRole, onClose, onSuccess }: Props) {
  const [verificationNotes, setVerificationNotes] = useState(request.verification_notes || '')
  const [recording, setRecording] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState(request.call_recording_url || '')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
      }

      mediaRecorder.start()
      setRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Failed to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const uploadRecording = async () => {
    if (!audioBlob) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, `dependant-verification-${request.id}.webm`)
      formData.append('bucket', 'call-recordings')
      formData.append('folder', 'dependant-verification-calls')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setRecordingUrl(data.url)
      alert('Recording uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload recording')
    } finally {
      setUploading(false)
    }
  }

  const handleVerify = async () => {
    if (!verificationNotes.trim()) {
      alert('Please add verification notes')
      return
    }

    if (!recordingUrl) {
      alert('Please upload the call recording first')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/plus1/dependant-requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          verification_notes: verificationNotes,
          call_recording_url: recordingUrl
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMsg = errorData.details || errorData.error || 'Verification failed'
        throw new Error(errorMsg)
      }

      alert('Dependant request verified successfully')
      onSuccess()
    } catch (error) {
      console.error('Verification error:', error)
      alert(error instanceof Error ? error.message : 'Failed to verify dependant request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this dependant addition? This will update the member\'s premium and create the dependant record.')) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/plus1/dependant-requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.details || data.error || 'Approval failed'
        throw new Error(errorMsg)
      }

      // Success - show dependant code in message
      const dependantCode = data.dependant_code || 'N/A'
      alert(`Dependant approved and added successfully!\n\nDependant Code: ${dependantCode}\nNew Premium: R${request.new_premium.toFixed(2)}`)
      onSuccess()
    } catch (error) {
      console.error('Approval error:', error)
      alert(error instanceof Error ? error.message : 'Failed to approve dependant')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/plus1/dependant-requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          rejection_reason: rejectionReason
        })
      })

      if (!response.ok) throw new Error('Rejection failed')

      alert('Dependant request rejected')
      onSuccess()
    } catch (error) {
      console.error('Rejection error:', error)
      alert('Failed to reject dependant request')
    } finally {
      setSubmitting(false)
      setShowRejectModal(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isVerified = request.status === 'verified' || request.status === 'approved'
  const canVerify = userRole === 'call_centre' || userRole === 'operations_manager'
  const canApprove = userRole === 'operations_manager' && request.status === 'verified'

  // If already verified, show verification details
  if (isVerified) {
    return (
      <Card className="border-2 border-green-500 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            Dependant Verification Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <p className="text-sm font-medium text-green-800 mb-2">
              ✓ This dependant request has been verified by call centre
            </p>
            
            {/* Verification Details */}
            <div className="space-y-3 mt-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Verified By:</p>
                <p className="text-sm text-gray-600">{request.verified_by || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Verified At:</p>
                <p className="text-sm text-gray-600">
                  {request.verified_at 
                    ? new Date(request.verified_at).toLocaleString() 
                    : 'N/A'}
                </p>
              </div>

              {/* Verified Checklist Items */}
              <div className="pt-3 border-t border-green-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Verified Information:</p>
                <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">✓ Member Name:</span>
                    <span className="font-semibold text-blue-600">
                      {request.member_first_name} {request.member_last_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">✓ Dependant Name:</span>
                    <span className="font-semibold text-blue-600">
                      {request.dependant_first_name} {request.dependant_last_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">✓ Dependant ID:</span>
                    <span className="font-semibold text-blue-600">
                      {request.dependant_id_number}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">✓ Relationship:</span>
                    <span className="font-semibold text-blue-600 capitalize">
                      {request.dependant_relationship}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">✓ Current Premium:</span>
                    <span className="font-semibold text-blue-600">
                      R{request.current_premium.toFixed(2)}/month
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">✓ New Premium:</span>
                    <span className="font-semibold text-blue-600">
                      R{request.new_premium.toFixed(2)}/month
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Premium Increase:</span>
                    <span className="font-bold text-orange-600">
                      +R{request.dependant_cost.toFixed(2)}/month
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Notes */}
              {request.verification_notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Verification Notes:</p>
                  <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {request.verification_notes}
                  </div>
                </div>
              )}

              {/* Call Recording */}
              {request.call_recording_url && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Call Recording:</p>
                  <audio 
                    controls 
                    className="w-full" 
                    preload="metadata"
                    src={request.call_recording_url}
                  >
                    Your browser does not support the audio element.
                  </audio>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => window.open(request.call_recording_url!, '_blank')}
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
              ℹ️ This dependant request has been verified and is ready for operations manager approval.
            </p>
          </div>

          {/* Operations Manager Approval Buttons */}
          {canApprove && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
                disabled={submitting}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Dependant
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-red-600 hover:bg-red-50"
                onClick={() => setShowRejectModal(true)}
                disabled={submitting}
              >
                Reject Dependant
              </Button>
            </div>
          )}

          {/* Close Button */}
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Show verification form for pending requests
  return (
    <Card className="border-2 border-blue-500">
      <CardHeader>
        <CardTitle>Dependant Verification</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Verify dependant addition request via phone call
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Member & Dependant Information Cards - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base">Member Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-medium">{request.member_first_name} {request.member_last_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Mobile</p>
                  <p className="font-medium text-blue-600">
                    <a href={`tel:${request.mobile_number}`}>{request.mobile_number}</a>
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{request.member_email}</p>
                </div>
                {request.member_plan_name && (
                  <div>
                    <p className="text-gray-600">Plan</p>
                    <p className="font-medium">{request.member_plan_name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-base">Dependant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-medium">{request.dependant_first_name} {request.dependant_last_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">ID Number</p>
                  <p className="font-medium text-blue-600">{request.dependant_id_number}</p>
                </div>
                <div>
                  <p className="text-gray-600">Date of Birth</p>
                  <p className="font-medium">{new Date(request.dependant_date_of_birth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Gender</p>
                  <p className="font-medium capitalize">{request.dependant_gender}</p>
                </div>
                <div>
                  <p className="text-gray-600">Relationship</p>
                  <p className="font-medium capitalize">{request.dependant_relationship}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Summary */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-base">Premium Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Current Premium</p>
                  <p className="font-medium">R{request.current_premium.toFixed(2)}/month</p>
                  {request.member_plan_name && (
                    <p className="text-xs text-gray-500 mt-1">{request.member_plan_name}</p>
                  )}
                </div>
                <div className="text-2xl text-gray-400">+</div>
                <div>
                  <p className="text-sm text-gray-600">Dependant Cost</p>
                  <p className="font-medium text-green-600">R{request.dependant_cost.toFixed(2)}/month</p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{request.dependant_relationship}</p>
                </div>
                <div className="text-2xl text-gray-400">=</div>
                <div>
                  <p className="text-sm text-gray-600">New Premium</p>
                  <p className="font-medium text-blue-600">R{request.new_premium.toFixed(2)}/month</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">Premium Increase</p>
                <p className="text-lg font-bold text-orange-600">
                  +R{request.dependant_cost.toFixed(2)}/month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        {request.id_document_url && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Dependant ID Document</label>
            <div className="border-2 border-blue-300 rounded-lg overflow-hidden">
              <iframe
                src={request.id_document_url}
                className="w-full h-[400px]"
                title="Dependant ID Document"
              >
                <p className="p-4 text-center text-gray-500">
                  Your browser does not support document viewing. 
                  <a 
                    href={request.id_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline ml-1"
                  >
                    Open document in new tab
                  </a>
                </p>
              </iframe>
            </div>
          </div>
        )}

        {/* Call Recording - REQUIRED */}
        {canVerify && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-red-600">Call Recording (Required) *</label>
            
            {!audioBlob && !recordingUrl && (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-800">
                    ⚠️ Call recording is required. Start recording before proceeding.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {!recording ? (
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

            {audioBlob && !recordingUrl && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm text-green-800 mb-2">
                    ✓ Call recorded successfully ({formatTime(recordingTime)})
                  </p>
                  <audio controls className="w-full" src={URL.createObjectURL(audioBlob)}>
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
                      setAudioBlob(null)
                      setRecordingTime(0)
                    }}
                  >
                    Re-record
                  </Button>
                </div>
              </div>
            )}

            {recordingUrl && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-sm text-green-800 mb-2">
                  ✓ Call recording uploaded successfully
                </p>
                <audio controls className="w-full" src={recordingUrl}>
                  Your browser does not support the audio element.
                </audio>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setRecordingUrl('')
                    setAudioBlob(null)
                  }}
                >
                  Record New Call
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Verification Checklist */}
        {canVerify && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-sm font-medium text-yellow-900 mb-3">
              Verification Checklist:
            </p>
            <ul className="text-sm text-yellow-800 space-y-2">
              <li className="flex items-start justify-between gap-4">
                <span>• Confirm member identity</span>
                <span className="font-semibold text-blue-600 text-right">
                  {request.member_first_name} {request.member_last_name}
                </span>
              </li>
              <li className="flex items-start justify-between gap-4">
                <span>• Verify dependant relationship</span>
                <span className="font-semibold text-blue-600 text-right capitalize">
                  {request.dependant_relationship}
                </span>
              </li>
              <li className="flex items-start justify-between gap-4">
                <span>• Confirm dependant ID number</span>
                <span className="font-semibold text-blue-600 text-right">
                  {request.dependant_id_number}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>• Review uploaded ID document</span>
              </li>
              <li className="flex items-start justify-between gap-4">
                <span>• Explain new premium amount</span>
                <span className="font-semibold text-blue-600 text-right">
                  R{request.new_premium.toFixed(2)}/month
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>• Confirm member understands waiting periods for dependant</span>
              </li>
              <li className="flex items-start justify-between gap-4">
                <span>• Confirm premium increase</span>
                <span className="font-semibold text-orange-600 text-right">
                  +R{request.dependant_cost.toFixed(2)}/month
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>• Check member's recent claim history</span>
              </li>
            </ul>
          </div>
        )}

        {/* Verification Notes */}
        {canVerify && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Verification Notes *</label>
            <textarea
              className="w-full px-3 py-2 border rounded-md"
              rows={6}
              placeholder="Document the verification call:
- Member confirmed identity
- Verified dependant relationship and details
- Explained new premium: R___ to R___
- Reviewed claim history: ___
- Member verbally consented to dependant addition
- Additional notes: ___"
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
            />
          </div>
        )}

        {/* Action Buttons */}
        {canVerify && (
          <div className="flex gap-3 pt-4 border-t">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleVerify}
              disabled={submitting || !verificationNotes.trim() || !recordingUrl}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify Dependant Request
            </Button>
          </div>
        )}

        {/* Close Button */}
        <Button onClick={onClose} variant="outline" className="w-full">
          Close
        </Button>
      </CardContent>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-semibold text-lg mb-4">Reject Dependant Request</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => setShowRejectModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || submitting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {submitting ? 'Rejecting...' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
