'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

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

  return (
    <div className="space-y-6">
      {/* Member & Dependant Info - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3 text-sm">Member Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <p className="font-medium text-gray-900">{request.member_first_name} {request.member_last_name}</p>
            </div>
            <div>
              <span className="text-gray-600">Mobile:</span>
              <p className="font-medium text-blue-600">{request.mobile_number}</p>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium text-gray-900">{request.member_email}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-3 text-sm">Dependant Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <p className="font-medium text-gray-900">{request.dependant_first_name} {request.dependant_last_name}</p>
            </div>
            <div>
              <span className="text-gray-600">ID Number:</span>
              <p className="font-medium text-blue-600">{request.dependant_id_number}</p>
            </div>
            <div>
              <span className="text-gray-600">DOB:</span>
              <p className="font-medium text-blue-600">{new Date(request.dependant_date_of_birth).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-600">Gender:</span>
              <p className="font-medium text-gray-900 capitalize">{request.dependant_gender}</p>
            </div>
            <div>
              <span className="text-gray-600">Relationship:</span>
              <p className="font-medium text-gray-900 capitalize">{request.dependant_relationship}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Premium Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600 text-xs mb-1">Current Premium</p>
            <p className="font-bold text-lg text-gray-900">R{request.current_premium.toFixed(2)}</p>
            {request.member_plan_name && (
              <p className="text-xs text-gray-500 mt-1">{request.member_plan_name}</p>
            )}
          </div>
          <div>
            <p className="text-gray-600 text-xs mb-1">Dependant Cost</p>
            <p className="font-bold text-lg text-green-600">+R{request.dependant_cost.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1 capitalize">{request.dependant_relationship}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs mb-1">New Premium</p>
            <p className="font-bold text-lg text-blue-600">R{request.new_premium.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Increase:</span> <span className="text-orange-600 font-semibold">+R{request.dependant_cost.toFixed(2)}/month</span>
          </p>
        </div>
      </div>

      {/* Documents */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Documents</h3>
        <div className="space-y-2">
          {request.id_document_url && (
            <a href={request.id_document_url} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
              📄 View ID Document
            </a>
          )}
        </div>
      </div>

      {/* Verification Section */}
      {!isVerified && canVerify && (
        <>
          {/* Call Recording */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Call Recording (Required)</h3>
            <div className="space-y-3">
              {!recording && !audioBlob && (
                <Button onClick={startRecording} variant="outline" className="w-full">
                  🎤 Start Recording Call
                </Button>
              )}

              {recording && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                      <span className="font-semibold">Recording: {formatTime(recordingTime)}</span>
                    </div>
                    <Button onClick={stopRecording} size="sm">
                      Stop Recording
                    </Button>
                  </div>
                </div>
              )}

              {audioBlob && !recordingUrl && (
                <div className="space-y-2">
                  <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
                  <Button onClick={uploadRecording} disabled={uploading} className="w-full">
                    {uploading ? 'Uploading...' : 'Upload Recording'}
                  </Button>
                </div>
              )}

              {recordingUrl && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-sm text-green-800 mb-2">✅ Recording uploaded successfully</p>
                  <audio controls src={recordingUrl} className="w-full" />
                </div>
              )}
            </div>
          </div>

          {/* Verification Notes */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Verification Notes (Required)</h3>
            <textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Document your verification call here..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={!recordingUrl || !verificationNotes.trim() || submitting}
            className="w-full"
          >
            {submitting ? 'Verifying...' : 'Verify & Submit to Operations'}
          </Button>
        </>
      )}

      {/* Verified View (for Operations Manager) */}
      {isVerified && (
        <>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">✅ Verified Information</h3>
            <p className="text-sm text-green-800 mb-2">
              Verified at: {request.verified_at ? new Date(request.verified_at).toLocaleString() : 'N/A'}
            </p>
            <div className="mt-3">
              <p className="text-sm font-medium text-green-900 mb-1">Verification Notes:</p>
              <p className="text-sm text-green-800 whitespace-pre-wrap">{request.verification_notes}</p>
            </div>
          </div>

          {request.call_recording_url && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Call Recording</h3>
              <audio controls src={request.call_recording_url} className="w-full" />
            </div>
          )}

          {canApprove && request.status === 'verified' && (
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {submitting ? 'Approving...' : 'Approve Dependant'}
              </Button>
              <Button
                onClick={() => setShowRejectModal(true)}
                disabled={submitting}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                Reject
              </Button>
            </div>
          )}
        </>
      )}

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

      {/* Close Button */}
      <Button onClick={onClose} variant="outline" className="w-full">
        Close
      </Button>
    </div>
  )
}
