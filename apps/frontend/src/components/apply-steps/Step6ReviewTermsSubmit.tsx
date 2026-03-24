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
      case 'brochure':
        return `View the complete plan brochure for ${data.planName || 'your selected plan'}.\n\nThis brochure contains detailed information about your coverage, benefits, waiting periods, and terms.`
      case 'coverage':
        return `Selected Plan: ${data.planName || 'N/A'}\nMonthly Premium: R${data.monthlyPrice || 'N/A'}\n\nYour coverage begins on the plan start date after approval and first payment. Waiting periods apply as specified in your plan.`
      case 'payment':
        return `Bank: ${data.bankName || 'N/A'}\nAccount Holder: ${data.accountHolderName || 'N/A'}\nDebit Order Day: ${data.debitOrderDay || 'N/A'} of each month\n\nMonthly premiums are due on the debit order day you selected. Failure to pay may result in suspension of cover.`
      default:
        return ''
    }
  }

  const getBrochureUrl = () => {
    // Map plan names to brochure filenames
    const planName = data.planName?.toLowerCase() || ''
    
    // Match the actual brochure filenames in the brochures folder
    if (planName.includes('value plus hospital')) return '/brochures/Day 1 Health Value Plus Hospital Plan 2025.pdf'
    if (planName.includes('value plus senior hospital')) return '/brochures/Day1 Health Value Plus Senior Hospital Plan 2025.pdf'
    if (planName.includes('value plus')) return '/brochures/Day1 Health Value Plus Plan 2025.pdf'
    if (planName.includes('executive hospital')) return '/brochures/Day1 Health Executive Hospital Plan 2025.pdf'
    if (planName.includes('executive')) return '/brochures/Day1 Health Executive Plan 2025.pdf'
    if (planName.includes('platinum hospital')) return '/brochures/Day1 Health Platinum Hospital Plan 2025.pdf'
    if (planName.includes('platinum')) return '/brochures/Day1 Health Platinum Plan 2025.pdf'
    if (planName.includes('senior comprehensive')) return '/brochures/Day1 Health Senior Comprehensive Plan 2025.pdf'
    
    // Default fallback to Value Plus Hospital
    return '/brochures/Day 1 Health Value Plus Hospital Plan 2025.pdf'
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
            </div>
          </div>

          {/* Dependents */}
          {data.dependents && data.dependents.length > 0 && (
            <div className="bg-white rounded p-2 mb-2">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-xs font-bold">Dependents</h4>
                <button onClick={() => goToStep(3)} className="text-green-600 hover:text-green-700 text-xs font-medium">Edit</button>
              </div>
              <div className="space-y-1 text-xs">
                {data.dependents.map((dep, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{dep.firstName} {dep.lastName} ({dep.relationship})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical History */}
          {data.medicalHistory && (
            <div className="bg-white rounded p-2 mb-2">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-xs font-bold">Medical History</h4>
                <button onClick={() => goToStep(4)} className="text-green-600 hover:text-green-700 text-xs font-medium">Edit</button>
              </div>
              <div className="space-y-2 text-xs">
                {/* Chronic Medication */}
                <div>
                  <p className="font-medium text-gray-700">Chronic Medication:</p>
                  <p className="text-gray-600">{data.medicalHistory.chronicMedication === 'yes' ? 'Yes' : 'No'}</p>
                  {data.medicalHistory.chronicMedication === 'yes' && data.medicalHistory.chronicEntries && data.medicalHistory.chronicEntries.length > 0 && (
                    <div className="ml-2 mt-1 space-y-1">
                      {data.medicalHistory.chronicEntries.map((entry: any, idx: number) => (
                        <div key={idx} className="text-xs bg-gray-50 p-1 rounded">
                          <p><strong>{entry.person}:</strong> {entry.condition} - {entry.medication}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Other Treatment */}
                <div>
                  <p className="font-medium text-gray-700">Other Medical Treatment:</p>
                  <p className="text-gray-600">{data.medicalHistory.otherTreatment === 'yes' ? 'Yes' : 'No'}</p>
                  {data.medicalHistory.otherTreatment === 'yes' && data.medicalHistory.otherEntries && data.medicalHistory.otherEntries.length > 0 && (
                    <div className="ml-2 mt-1 space-y-1">
                      {data.medicalHistory.otherEntries.map((entry: any, idx: number) => (
                        <div key={idx} className="text-xs bg-gray-50 p-1 rounded">
                          <p><strong>{entry.person}:</strong> {entry.condition} - {entry.medication}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dental Treatment */}
                <div>
                  <p className="font-medium text-gray-700">Dental Treatment:</p>
                  <p className="text-gray-600">{data.medicalHistory.dentalTreatment === 'yes' ? 'Yes' : 'No'}</p>
                  {data.medicalHistory.dentalTreatment === 'yes' && data.medicalHistory.dentalEntries && data.medicalHistory.dentalEntries.length > 0 && (
                    <div className="ml-2 mt-1 space-y-1">
                      {data.medicalHistory.dentalEntries.map((entry: any, idx: number) => (
                        <div key={idx} className="text-xs bg-gray-50 p-1 rounded">
                          <p><strong>{entry.person}:</strong> {entry.condition} - {entry.medication}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Future Concerns */}
                <div>
                  <p className="font-medium text-gray-700">Future Medical Concerns:</p>
                  <p className="text-gray-600">{data.medicalHistory.futureConcerns === 'yes' ? 'Yes' : 'No'}</p>
                  {data.medicalHistory.futureConcerns === 'yes' && data.medicalHistory.futureEntries && data.medicalHistory.futureEntries.length > 0 && (
                    <div className="ml-2 mt-1 space-y-1">
                      {data.medicalHistory.futureEntries.map((entry: any, idx: number) => (
                        <div key={idx} className="text-xs bg-gray-50 p-1 rounded">
                          <p><strong>{entry.person}:</strong> {entry.condition} - {entry.medication}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Major Operations */}
                <div>
                  <p className="font-medium text-gray-700">Major Operations (past 5 years):</p>
                  <p className="text-gray-600">{data.medicalHistory.majorOperations === 'yes' ? 'Yes' : 'No'}</p>
                  {data.medicalHistory.majorOperations === 'yes' && data.medicalHistory.operationEntries && data.medicalHistory.operationEntries.length > 0 && (
                    <div className="ml-2 mt-1 space-y-1">
                      {data.medicalHistory.operationEntries.map((entry: any, idx: number) => (
                        <div key={idx} className="text-xs bg-gray-50 p-1 rounded">
                          <p><strong>{entry.person}:</strong> {entry.procedure} ({entry.date})</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hospital Admissions */}
                <div>
                  <p className="font-medium text-gray-700">Hospital Admissions (past 5 years):</p>
                  <p className="text-gray-600">{data.medicalHistory.hospitalAdmissions === 'yes' ? 'Yes' : 'No'}</p>
                  {data.medicalHistory.hospitalAdmissions === 'yes' && data.medicalHistory.hospitalEntries && data.medicalHistory.hospitalEntries.length > 0 && (
                    <div className="ml-2 mt-1 space-y-1">
                      {data.medicalHistory.hospitalEntries.map((entry: any, idx: number) => (
                        <div key={idx} className="text-xs bg-gray-50 p-1 rounded">
                          <p><strong>{entry.person}:</strong> {entry.reason} ({entry.date})</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Medical Aid Membership */}
                <div>
                  <p className="font-medium text-gray-700">Medical Aid/Hospital Plan Member:</p>
                  <p className="text-gray-600">{data.medicalHistory.medicalAidMember === 'yes' ? 'Yes' : 'No'}</p>
                  {data.medicalHistory.medicalAidMember === 'yes' && data.medicalHistory.medicalAidEntries && data.medicalHistory.medicalAidEntries.length > 0 && (
                    <div className="ml-2 mt-1 space-y-1">
                      {data.medicalHistory.medicalAidEntries.map((entry: any, idx: number) => (
                        <div key={idx} className="text-xs bg-gray-50 p-1 rounded">
                          <p><strong>{entry.person}:</strong> {entry.schemeName} (since {entry.inceptionDate})</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Banking Details */}
          {data.bankName && (
            <div className="bg-white rounded p-2 mb-2">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-xs font-bold">Banking Details</h4>
                <button onClick={() => goToStep(5)} className="text-green-600 hover:text-green-700 text-xs font-medium">Edit</button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <p className="text-gray-600 mb-0.5">Payment Method</p>
                  <p className="font-bold text-green-700">
                    {data.collection_method === 'eft' ? '💳 EFT Payment' : '🏦 Debit Order'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {data.collection_method === 'eft' 
                      ? 'You will receive payment notifications and upload proof of payment'
                      : 'Your account will be debited automatically each month'
                    }
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-600">Bank</p>
                    <p className="font-medium">{data.bankName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Account Holder</p>
                    <p className="font-medium">{data.accountHolderName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Account Number</p>
                    <p className="font-medium">{data.accountNumber ? `****${data.accountNumber.slice(-4)}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Branch Code</p>
                    <p className="font-medium">{data.branchCode || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">{data.collection_method === 'eft' ? 'Payment Date' : 'Debit Order Day'}</p>
                    <p className="font-medium">{data.debitOrderDay}{data.debitOrderDay === 1 ? 'st' : data.debitOrderDay === 2 ? 'nd' : data.debitOrderDay === 3 ? 'rd' : 'th'} of each month</p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              <span><strong>1. Plan Brochure:</strong> View the cover plan brochure</span>
              <a
                href={getBrochureUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View
              </a>
            </p>
            <p className="mb-1 flex justify-between items-center">
              <span><strong>2. Product Guide:</strong> View the complete product guide</span>
              <a
                href="/brochures/Day1 Health Product Guide.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View
              </a>
            </p>
            <p className="mb-1">
              <span><strong>3. Coverage:</strong> Begins after approval and first payment.</span>
            </p>
            <p>
              <span><strong>4. Payment:</strong> Monthly premiums due on selected day.</span>
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
