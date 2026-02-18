/**
 * Step 6 of 6: Review, Terms & Submit
 * 
 * Final step combining review, terms acceptance, and submission.
 * - Application summary with edit buttons
 * - Terms & Conditions with expandable modals
 * - Voice recording (REQUIRED for insurance compliance)
 * - Digital signature (REQUIRED for insurance compliance)
 * - Marketing consent (OPTIONAL with channel selection)
 * - POPIA compliance notices
 * - Final submission to database
 * 
 * This step consolidates what were previously Steps 8 (Terms) and 9 (Review)
 * Part of Day1Health 6-step application flow
 */

'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import SignatureCanvas from 'react-signature-canvas'
import { ApplicationData } from '@/types/application'
import { uploadVoiceRecording, uploadSignature, generateTempApplicationNumber } from '@/lib/storage'

interface Props {
  data: ApplicationData
  updateData: (data: Partial<ApplicationData>) => void
  prevStep: () => void
  goToStep: (step: number) => void
}

export default function Step6ReviewTermsSubmit({ data, updateData, prevStep, goToStep }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [voiceRecorded, setVoiceRecorded] = useState(!!data.voiceRecordingUrl)
  const [recording, setRecording] = useState(false)
  const [signatureSaved, setSignatureSaved] = useState(!!data.signatureUrl)
  const [termsAccepted, setTermsAccepted] = useState(data.termsAccepted || false)
  const [marketingConsent, setMarketingConsent] = useState(data.marketingConsent !== undefined ? data.marketingConsent : true)
  const [emailConsent, setEmailConsent] = useState(data.emailConsent !== undefined ? data.emailConsent : true)
  const [smsConsent, setSmsConsent] = useState(data.smsConsent !== undefined ? data.smsConsent : true)
  const [phoneConsent, setPhoneConsent] = useState(data.phoneConsent !== undefined ? data.phoneConsent : true)
  const [viewModal, setViewModal] = useState<string | null>(null)
  
  const signatureRef = useRef<SignatureCanvas>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [uploadingVoice, setUploadingVoice] = useState(false)
  const [uploadingSignature, setUploadingSignature] = useState(false)

  const getModalContent = (type: string) => {
    switch(type) {
      case 'agreement':
        return `By signing this application, you agree to the terms and conditions of Day1Health medical insurance.\n\nThis agreement is legally binding and covers all aspects of your medical insurance policy with Day1Health.`
      case 'coverage':
        return `Selected Plan: ${data.planName || 'N/A'}\nMonthly Premium: R${data.monthlyPrice || 'N/A'}\n\nYour coverage begins on the plan start date after approval and first payment. Waiting periods apply as specified in your plan.`
      case 'payment':
        return `Bank: ${data.bankName || 'N/A'}\nAccount Holder: ${data.accountHolderName || 'N/A'}\nDebit Order Day: ${data.debitOrderDay || 'N/A'} of each month\n\nMonthly premiums are due on the debit order day you selected. Failure to pay may result in suspension of cover.`
      case 'privacy':
        return `Your information is protected under POPIA (Protection of Personal Information Act).\n\nWe will not share your data without consent except as required by law.`
      default:
        return ''
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        // Store blob temporarily for playback
        updateData({ voiceRecordingUrl: audioUrl })
        setVoiceRecorded(true)
        
        // Upload to Supabase Storage
        setUploadingVoice(true)
        const tempAppNumber = data.planName ? `TEMP-${Date.now()}` : generateTempApplicationNumber()
        
        uploadVoiceRecording(audioBlob, tempAppNumber)
          .then((publicUrl) => {
            updateData({ voiceRecordingUrl: publicUrl })
            setUploadingVoice(false)
          })
          .catch((error) => {
            console.error('Failed to upload voice recording:', error)
            setUploadingVoice(false)
            // Keep the blob URL as fallback
          })
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (err) {
      alert('Unable to access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const clearSignature = () => {
    signatureRef.current?.clear()
    setSignatureSaved(false)
  }

  const saveSignature = async () => {
    if (signatureRef.current?.isEmpty()) {
      alert('Please provide your signature')
      return
    }
    
    const signatureDataUrl = signatureRef.current?.toDataURL()
    if (!signatureDataUrl) return
    
    // Store data URL temporarily for display
    updateData({ signatureUrl: signatureDataUrl })
    setSignatureSaved(true)
    
    // Upload to Supabase Storage
    setUploadingSignature(true)
    const tempAppNumber = data.planName ? `TEMP-${Date.now()}` : generateTempApplicationNumber()
    
    try {
      const publicUrl = await uploadSignature(signatureDataUrl, tempAppNumber)
      updateData({ signatureUrl: publicUrl })
      setUploadingSignature(false)
    } catch (error) {
      console.error('Failed to upload signature:', error)
      setUploadingSignature(false)
      // Keep the data URL as fallback
    }
  }

  const handleSubmit = async () => {
    if (!voiceRecorded) {
      alert('Please record your voice acceptance')
      return
    }
    if (!signatureSaved) {
      alert('Please provide your signature')
      return
    }
    if (!termsAccepted) {
      alert('Please accept the terms and conditions')
      return
    }
    
    updateData({ 
      termsAccepted: true,
      marketingConsent,
      marketingConsentDate: marketingConsent ? new Date().toISOString() : undefined,
      emailConsent,
      smsConsent,
      phoneConsent,
    })

    setSubmitting(true)
    
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          termsAccepted: true,
          marketingConsent,
          marketingConsentDate: marketingConsent ? new Date().toISOString() : undefined,
          emailConsent,
          smsConsent,
          phoneConsent,
        }),
      })

      if (!response.ok) throw new Error('Submission failed')

      const result = await response.json()
      router.push(`/application-submitted?ref=${result.applicationNumber}`)
    } catch (error) {
      alert('Failed to submit application. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Review, Terms & Submit</h2>
      <p className="text-xs text-gray-600 mb-3">Review your application, accept terms, and submit</p>

      <div className="space-y-3">
        {/* Review Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h3 className="text-sm font-bold mb-2">📋 Application Summary</h3>
          
          {/* Personal Info */}
          <div className="bg-white rounded p-2 mb-2">
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-xs font-bold">Personal Information</h4>
              <button onClick={() => goToStep(1)} className="text-green-600 hover:text-green-700 text-xs font-medium">Edit</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium">{data.firstName} {data.lastName}</p>
              </div>
              <div>
                <p className="text-gray-600">ID Number</p>
                <p className="font-medium">{data.idNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{data.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Mobile</p>
                <p className="font-medium">{data.mobile}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded p-2 mb-2">
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-xs font-bold">Documents</h4>
              <button onClick={() => goToStep(2)} className="text-green-600 hover:text-green-700 text-xs font-medium">Edit</button>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className={data.idDocumentUrl ? 'text-green-600' : 'text-gray-400'}>{data.idDocumentUrl ? '✓' : '○'}</span>
                <span>ID Document</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={data.proofOfAddressUrl ? 'text-green-600' : 'text-gray-400'}>{data.proofOfAddressUrl ? '✓' : '○'}</span>
                <span>Proof of Address</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={data.selfieUrl ? 'text-green-600' : 'text-gray-400'}>{data.selfieUrl ? '✓' : '○'}</span>
                <span>Selfie</span>
              </div>
            </div>
          </div>

          {/* Plan Info */}
          {data.planName && (
            <div className="bg-white rounded p-2">
              <h4 className="text-xs font-bold mb-1">Selected Plan</h4>
              <div className="text-xs">
                <p className="font-medium">{data.planName}</p>
                <p className="text-gray-600">Monthly Premium: R{data.monthlyPrice}</p>
              </div>
            </div>
          )}
        </div>

        {/* Terms & Conditions */}
        <div className="border border-gray-300 rounded-lg p-3">
          <h3 className="text-sm font-bold mb-2">📜 Terms & Conditions</h3>
          
          <div className="border border-gray-300 rounded p-2 max-h-32 overflow-y-auto bg-gray-50 text-xs mb-2">
            <p className="font-bold mb-1">Day1Health Terms and Conditions</p>
            <p className="mb-1 flex justify-between items-center">
              <span><strong>1. Agreement:</strong> By signing, you agree to Day1Health terms.</span>
              <button onClick={() => setViewModal('agreement')} className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">View</button>
            </p>
            <p className="mb-1 flex justify-between items-center">
              <span><strong>2. Coverage:</strong> Begins after approval and first payment.</span>
              <button onClick={() => setViewModal('coverage')} className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">View</button>
            </p>
            <p className="mb-1 flex justify-between items-center">
              <span><strong>3. Payment:</strong> Monthly premiums due on selected day.</span>
              <button onClick={() => setViewModal('payment')} className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">View</button>
            </p>
            <p className="flex justify-between items-center">
              <span><strong>4. Privacy:</strong> Protected under POPIA.</span>
              <button onClick={() => setViewModal('privacy')} className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">View</button>
            </p>
          </div>

          {/* Modal */}
          {viewModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setViewModal(null)}>
              <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold">Details</h3>
                  <button onClick={() => setViewModal(null)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
                </div>
                <div className="text-xs whitespace-pre-line">{getModalContent(viewModal)}</div>
                <button onClick={() => setViewModal(null)} className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Close</button>
              </div>
            </div>
          )}

          {/* Voice Recording */}
          <div className="border border-gray-300 rounded p-2 mb-2">
            <h4 className="text-xs font-bold mb-1">🎤 Voice Acceptance (Required)</h4>
            <p className="text-xs text-gray-600 mb-2">
              Record: "I, {data.firstName} {data.lastName}, accept the terms and conditions of Day1Health"
            </p>
            
            {!voiceRecorded ? (
              <div className="space-y-1">
                <button
                  onClick={recording ? stopRecording : startRecording}
                  disabled={uploadingVoice}
                  className={`w-full px-3 py-2 text-sm rounded font-medium ${
                    recording ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'
                  } ${uploadingVoice ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploadingVoice ? '⏳ Uploading...' : recording ? '⏹ Stop Recording' : '🎤 Start Recording'}
                </button>
                {recording && (
                  <div className="flex items-center justify-center gap-1 text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    <span className="text-xs font-medium">Recording...</span>
                  </div>
                )}
                {uploadingVoice && (
                  <div className="flex items-center justify-center gap-1 text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    <span className="text-xs font-medium">Uploading to storage...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-green-800 font-medium">✓ Voice recorded</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (data.voiceRecordingUrl) {
                          const audio = new Audio(data.voiceRecordingUrl)
                          audio.play()
                        }
                      }}
                      className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      🔊 Listen
                    </button>
                    <button
                      onClick={() => {
                        updateData({ voiceRecordingUrl: undefined })
                        setVoiceRecorded(false)
                      }}
                      className="px-2 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Digital Signature */}
          <div className="border border-gray-300 rounded p-2">
            <h4 className="text-xs font-bold mb-1">✍️ Digital Signature (Required)</h4>
            <p className="text-xs text-gray-600 mb-1">Sign using your mouse or finger</p>
            
            <div className="border-2 border-gray-300 rounded bg-white">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{ className: 'w-full h-24' }}
              />
            </div>
            
            <div className="flex gap-2 mt-2">
              <button
                onClick={clearSignature}
                disabled={uploadingSignature}
                className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Clear
              </button>
              <button
                onClick={saveSignature}
                disabled={uploadingSignature}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {uploadingSignature ? '⏳ Uploading...' : 'Save Signature'}
              </button>
            </div>
            
            {uploadingSignature && (
              <div className="mt-1 flex items-center gap-1 text-blue-600 text-xs">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span>Uploading to storage...</span>
              </div>
            )}
            
            {signatureSaved && !uploadingSignature && (
              <div className="mt-1 text-xs text-green-600 font-medium">✓ Signature saved</div>
            )}
          </div>
        </div>

        {/* Final Acceptance */}
        <div className="border-2 border-green-200 rounded-lg p-3 bg-green-50">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-xs font-medium">
              I confirm that I have read, understood, and accept the terms and conditions. I authorize Day1Health to process my application and debit my bank account for monthly premiums.
            </span>
          </label>
        </div>

        {/* Marketing Consent */}
        <div className="border border-gray-200 rounded-lg p-3 bg-blue-50">
          <h3 className="text-sm font-bold mb-2">📧 Marketing Communications (Optional)</h3>
          
          <div className="space-y-2">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-0.5"
              />
              <div>
                <span className="text-xs font-medium">I consent to receive marketing communications from Day1Health</span>
                <p className="text-xs text-gray-600 mt-0.5">
                  Receive information about new products, special offers, health tips, and policy updates.
                </p>
              </div>
            </label>

            {marketingConsent && (
              <div className="space-y-1.5 ml-6">
                <p className="text-xs font-medium text-gray-700">Select your preferred channels:</p>
                
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={emailConsent} onChange={(e) => setEmailConsent(e.target.checked)} />
                  <span className="text-xs">Email</span>
                </label>

                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} />
                  <span className="text-xs">SMS</span>
                </label>

                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={phoneConsent} onChange={(e) => setPhoneConsent(e.target.checked)} />
                  <span className="text-xs">Phone calls</span>
                </label>
              </div>
            )}

            <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200">
              <p><strong>POPIA Notice:</strong> You can unsubscribe anytime. This consent is separate from essential service communications.</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between pt-2 pb-10">
          <button
            onClick={prevStep}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !voiceRecorded || !signatureSaved || !termsAccepted}
            className={`px-6 py-2 rounded font-medium ${
              submitting || !voiceRecorded || !signatureSaved || !termsAccepted
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {submitting ? '⏳ Submitting...' : '✓ Submit Application'}
          </button>
        </div>
      </div>
    </div>
  )
}
