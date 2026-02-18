/**
 * Step 2 of 6: Documents
 * 
 * Handles document uploads with OCR extraction using Google Cloud Vision API.
 * Features:
 * - ID Document upload (SA ID, Passport, Driver's License)
 * - Google Vision OCR extraction (95-99% accuracy)
 * - Proof of Address upload (images and PDFs)
 * - Selfie capture (camera or file upload)
 * - Image rotation controls for all uploads
 * - Progress indicator (X of 3 documents uploaded)
 * - Verification form for OCR extracted data
 * 
 * Part of Day1Health 6-step application flow
 */

'use client'

import { useState, useRef } from 'react'
import { ApplicationData } from '@/types/application'

interface DocumentItem {
  url: string
  type: 'image' | 'pdf'
  name: string
}

interface Props {
  data: ApplicationData
  updateData: (data: Partial<ApplicationData>) => void
  nextStep: () => void
  prevStep: () => void
}

export default function Step2Documents({ data, updateData, nextStep, prevStep }: Props) {
  // ID Document
  const [idDocument, setIdDocument] = useState<string | null>(data.idDocumentUrl || null)
  const [documentType, setDocumentType] = useState<'sa-id' | 'sa-passport' | 'drivers-license'>('sa-passport')
  const [extracting, setExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState({
    idNumber: data.idNumber || '',
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    dateOfBirth: data.dateOfBirth || '',
  })
  const [showVerification, setShowVerification] = useState(false)
  
  // Proof of Address
  const [addressDocs, setAddressDocs] = useState<DocumentItem[]>([])
  
  // Selfie
  const [selfie, setSelfie] = useState<string | null>(data.selfieUrl || null)
  const [cameraActive, setCameraActive] = useState(false)
  
  const idFileInputRef = useRef<HTMLInputElement>(null)
  const addressFileInputRef = useRef<HTMLInputElement>(null)
  const selfieFileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const rotateImage = (imageUrl: string, degrees: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        if (degrees === 90 || degrees === 270 || degrees === -90 || degrees === -270) {
          canvas.width = img.height
          canvas.height = img.width
        } else {
          canvas.width = img.width
          canvas.height = img.height
        }
        
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((degrees * Math.PI) / 180)
        ctx.drawImage(img, -img.width / 2, -img.height / 2)
        
        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }
      img.src = imageUrl
    })
  }

  const extractDataWithGoogleVision = async (imageUrl: string, docType: string) => {
    setExtracting(true)
    
    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageUrl,
          documentType: docType,
        }),
      })
      
      if (!response.ok) {
        throw new Error('OCR request failed')
      }
      
      const result = await response.json()
      
      if (result.success && result.extractedData) {
        setExtractedData({
          idNumber: result.extractedData.idNumber || '',
          firstName: result.extractedData.firstName || '',
          lastName: result.extractedData.lastName || '',
          dateOfBirth: result.extractedData.dateOfBirth || '',
        })
      }
      
      setShowVerification(true)
      setExtracting(false)
      
    } catch (error) {
      console.error('OCR Error:', error)
      setExtracting(false)
      setShowVerification(true)
    }
  }

  // ID Document Handlers
  const handleIdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const imageUrl = reader.result as string
      const img = new Image()
      img.onload = async () => {
        const isVertical = img.height > img.width
        const finalUrl = isVertical ? await rotateImage(imageUrl, 90) : imageUrl
        setIdDocument(finalUrl)
        updateData({ idDocumentUrl: finalUrl })
        
        await extractDataWithGoogleVision(finalUrl, documentType)
      }
      img.src = imageUrl
    }
    reader.readAsDataURL(file)
  }

  const handleIdRotate = async (direction: 'left' | 'right') => {
    if (!idDocument) return
    const degrees = direction === 'left' ? -90 : 90
    const rotatedUrl = await rotateImage(idDocument, degrees)
    setIdDocument(rotatedUrl)
    updateData({ idDocumentUrl: rotatedUrl })
  }

  // Address Document Handlers
  const handleAddressFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || addressDocs.length >= 1) return

    const isPdf = file.type === 'application/pdf'

    if (isPdf) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const newDoc: DocumentItem = {
          url: reader.result as string,
          type: 'pdf',
          name: file.name
        }
        setAddressDocs([newDoc])
        updateData({ 
          proofOfAddressUrl: newDoc.url,
          proofOfAddressUrls: [newDoc.url]
        })
      }
      reader.readAsDataURL(file)
    } else {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const imageUrl = reader.result as string
        const img = new Image()
        img.onload = async () => {
          const isVertical = img.height > img.width
          const finalUrl = isVertical ? await rotateImage(imageUrl, 90) : imageUrl
          
          const newDoc: DocumentItem = {
            url: finalUrl,
            type: 'image',
            name: file.name
          }
          setAddressDocs([newDoc])
          updateData({ 
            proofOfAddressUrl: newDoc.url,
            proofOfAddressUrls: [newDoc.url]
          })
        }
        img.src = imageUrl
      }
      reader.readAsDataURL(file)
    }
    
    e.target.value = ''
  }

  const handleAddressRotate = async (direction: 'left' | 'right') => {
    const doc = addressDocs[0]
    if (!doc || doc.type !== 'image') return
    
    const degrees = direction === 'left' ? -90 : 90
    const rotatedUrl = await rotateImage(doc.url, degrees)
    
    const updated = { ...doc, url: rotatedUrl }
    setAddressDocs([updated])
    updateData({ 
      proofOfAddressUrl: updated.url,
      proofOfAddressUrls: [updated.url]
    })
  }

  const handleAddressDelete = () => {
    setAddressDocs([])
    updateData({ 
      proofOfAddressUrl: undefined,
      proofOfAddressUrls: undefined
    })
  }

  // Selfie Handlers
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (err) {
      alert('Unable to access camera. Please upload a photo instead.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      setCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0)
      const imageUrl = canvas.toDataURL('image/jpeg')
      setSelfie(imageUrl)
      updateData({ selfieUrl: imageUrl })
      stopCamera()
    }
  }

  const handleSelfieFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setSelfie(result)
      updateData({ selfieUrl: result })
    }
    reader.readAsDataURL(file)
  }

  const handleSelfieRotate = async (direction: 'left' | 'right') => {
    if (!selfie) return
    const degrees = direction === 'left' ? -90 : 90
    const rotatedUrl = await rotateImage(selfie, degrees)
    setSelfie(rotatedUrl)
    updateData({ selfieUrl: rotatedUrl })
  }

  const handleConfirm = () => {
    updateData({
      idNumber: extractedData.idNumber,
      firstName: extractedData.firstName,
      lastName: extractedData.lastName,
      dateOfBirth: extractedData.dateOfBirth,
    })
    setShowVerification(false)
  }

  const handleNext = () => {
    if (!idDocument) {
      alert('Please upload your ID document')
      return
    }
    if (addressDocs.length === 0) {
      alert('Please upload proof of address')
      return
    }
    if (!selfie) {
      alert('Please take a selfie or upload a photo')
      return
    }
    nextStep()
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Documents & Verification</h2>
      <p className="text-xs text-gray-600 mb-3">Upload all required documents</p>

      <div className="space-y-3">
        {/* 1. ID Document */}
        <div className="border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idDocument ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {idDocument ? '✓' : '1'}
              </div>
              <h3 className="text-sm font-bold">ID Document</h3>
            </div>
            {idDocument && <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>}
          </div>

          {!idDocument ? (
            <div className="space-y-2">
              <div className="bg-white border border-gray-300 rounded p-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Document Type:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDocumentType('sa-id')}
                    className={`px-3 py-2 text-xs rounded border transition-colors ${
                      documentType === 'sa-id'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                    }`}
                  >
                    🪪 SA ID Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocumentType('sa-passport')}
                    className={`px-3 py-2 text-xs rounded border transition-colors ${
                      documentType === 'sa-passport'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                    }`}
                  >
                    📘 Passport
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocumentType('drivers-license')}
                    className={`px-3 py-2 text-xs rounded border transition-colors ${
                      documentType === 'drivers-license'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                    }`}
                  >
                    🚗 Driver's License
                  </button>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded bg-white p-3 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <button
                  onClick={() => idFileInputRef.current?.click()}
                  className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                >
                  Upload Document
                </button>
                <p className="text-xs text-gray-500 mt-1">Smart scanning with Google Vision AI</p>
                <input
                  ref={idFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleIdFileChange}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <img 
                src={idDocument} 
                alt="ID Document" 
                className="w-full max-h-32 rounded object-contain bg-white"
              />
              
              {extracting && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-blue-900">🤖 Google Vision AI extracting data...</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                  </div>
                </div>
              )}
              
              {showVerification && !extracting && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded p-3">
                  <h4 className="text-sm font-bold text-yellow-900 mb-2">📋 Verify Extracted Information</h4>
                  <p className="text-xs text-yellow-800 mb-2">Please review and correct if necessary:</p>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">ID Number</label>
                      <input
                        type="text"
                        value={extractedData.idNumber}
                        onChange={(e) => setExtractedData(prev => ({ ...prev, idNumber: e.target.value }))}
                        maxLength={13}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">First Name</label>
                        <input
                          type="text"
                          value={extractedData.firstName}
                          onChange={(e) => setExtractedData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Last Name</label>
                        <input
                          type="text"
                          value={extractedData.lastName}
                          onChange={(e) => setExtractedData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Date of Birth</label>
                      <input
                        type="date"
                        value={extractedData.dateOfBirth}
                        onChange={(e) => setExtractedData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    
                    <button
                      onClick={handleConfirm}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium text-sm"
                    >
                      ✓ Confirm & Save
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleIdRotate('left')}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  ↺ Rotate
                </button>
                <button
                  onClick={() => handleIdRotate('right')}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  Rotate ↻
                </button>
                <button
                  onClick={() => {
                    setIdDocument(null)
                    setShowVerification(false)
                    updateData({ idDocumentUrl: undefined })
                  }}
                  className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Proof of Address */}
        <div className="border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${addressDocs.length > 0 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {addressDocs.length > 0 ? '✓' : '2'}
              </div>
              <h3 className="text-sm font-bold">Proof of Address</h3>
            </div>
            {addressDocs.length > 0 && <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>}
          </div>

          {addressDocs.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded bg-white p-3 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <button
                onClick={() => addressFileInputRef.current?.click()}
                className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium"
              >
                Upload Proof of Address
              </button>
              <p className="text-xs text-gray-500 mt-1">Utility bill or bank statement (max 3 months old)</p>
              <input
                ref={addressFileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleAddressFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-2">
              {addressDocs[0].type === 'image' ? (
                <>
                  <img 
                    src={addressDocs[0].url} 
                    alt={addressDocs[0].name} 
                    className="w-full max-h-32 rounded object-contain bg-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddressRotate('left')}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                      ↺ Rotate
                    </button>
                    <button
                      onClick={() => handleAddressRotate('right')}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Rotate ↻
                    </button>
                    <button
                      onClick={handleAddressDelete}
                      className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full h-24 bg-red-100 rounded flex flex-col items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-red-700 font-medium mt-1">PDF Document</p>
                  </div>
                  <p className="text-xs text-center truncate">{addressDocs[0].name}</p>
                  <button
                    onClick={handleAddressDelete}
                    className="w-full px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 3. Selfie Verification */}
        <div className="border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${selfie ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {selfie ? '✓' : '3'}
              </div>
              <h3 className="text-sm font-bold">Selfie Verification</h3>
            </div>
            {selfie && <span className="text-xs text-green-600 font-medium">✓ Captured</span>}
          </div>

          {!selfie && !cameraActive && (
            <div className="space-y-2">
              <button
                onClick={startCamera}
                className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium"
              >
                📸 Take Selfie
              </button>
              <div className="text-center text-xs text-gray-500">or</div>
              <button
                onClick={() => selfieFileInputRef.current?.click()}
                className="w-full px-3 py-2 text-sm border-2 border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
              >
                📁 Upload Photo
              </button>
              <input
                ref={selfieFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleSelfieFileChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500 text-center">Face camera directly • Good lighting • No glasses/hats</p>
            </div>
          )}

          {cameraActive && (
            <div className="space-y-2">
              <div className="relative bg-black rounded overflow-hidden aspect-square">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={capturePhoto}
                  className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                >
                  📸 Capture
                </button>
                <button
                  onClick={stopCamera}
                  className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {selfie && (
            <div className="space-y-2">
              <div className="border-2 border-gray-300 rounded overflow-hidden aspect-square">
                <img src={selfie} alt="Selfie" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSelfieRotate('left')}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  ↺ Rotate
                </button>
                <button
                  onClick={() => handleSelfieRotate('right')}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  Rotate ↻
                </button>
                <button
                  onClick={() => {
                    setSelfie(null)
                    updateData({ selfieUrl: undefined })
                  }}
                  className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Retake
                </button>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Progress Indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded p-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-blue-900">
              {[idDocument, addressDocs.length > 0, selfie].filter(Boolean).length} of 3 documents uploaded
            </span>
            <span className="text-blue-700">
              {Math.round(([idDocument, addressDocs.length > 0, selfie].filter(Boolean).length / 3) * 100)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${([idDocument, addressDocs.length > 0, selfie].filter(Boolean).length / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between pt-2 pb-10">
          <button
            onClick={prevStep}
            className="px-4 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium"
          >
            Next: Dependents
          </button>
        </div>
      </div>
    </div>
  )
}
