'use client'

import { useState, useRef, useEffect } from 'react'
import { ApplicationData } from '@/types/application'

declare global {
  interface Window {
    cv: any;
  }
}

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
  console.log('Step2Documents rendering...', { data })
  console.log('About to render JSX...')
  
  const [cvLoaded, setCvLoaded] = useState(false)
  
  // Load OpenCV
  useEffect(() => {
    // Check if OpenCV is already loaded
    if (window.cv && window.cv.Mat) {
      console.log('OpenCV already loaded')
      setCvLoaded(true)
      return
    }
    
    // Check if script is already in the document
    const existingScript = document.querySelector('script[src*="opencv.js"]')
    if (existingScript) {
      console.log('OpenCV script already exists, waiting for load...')
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.cv && window.cv.Mat) {
          console.log('OpenCV loaded successfully')
          setCvLoaded(true)
          clearInterval(checkInterval)
        }
      }, 100)
      
      return () => clearInterval(checkInterval)
    }
    
    // Load OpenCV for the first time
    const script = document.createElement('script')
    script.src = 'https://docs.opencv.org/4.5.2/opencv.js'
    script.async = true
    script.onload = () => {
      if (window.cv) {
        window.cv.onRuntimeInitialized = () => {
          console.log('OpenCV loaded successfully')
          setCvLoaded(true)
        }
      }
    }
    document.body.appendChild(script)
    
    // Don't remove the script on unmount - keep it loaded
    return () => {
      // Cleanup function - but don't remove script
    }
  }, [])
  
  // ID Document
  const [idDocument, setIdDocument] = useState<string | null>(data.idDocumentUrl || null)
  const [documentType, setDocumentType] = useState<'sa-id' | 'sa-passport' | 'drivers-license'>('sa-id')
  const [showRegions, setShowRegions] = useState(false)
  const [regionPreview, setRegionPreview] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState({
    idNumber: data.idNumber || '',
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    dateOfBirth: data.dateOfBirth || '',
    verified: false
  })
  const [showVerification, setShowVerification] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [detectingDocument, setDetectingDocument] = useState(false)
  
  // Proof of Address
  const [addressDocs, setAddressDocs] = useState<DocumentItem[]>([])
  
  // Selfie
  const [selfie, setSelfie] = useState<string | null>(data.selfieUrl || null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraType, setCameraType] = useState<'selfie' | null>(null)
  
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

  // Detect document borders and normalize (crop + stretch to standard size)
  const detectAndNormalizeDocument = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!cvLoaded || !window.cv) {
        console.log('OpenCV not loaded, skipping normalization')
        resolve(imageUrl)
        return
      }

      const img = new Image()
      img.onload = () => {
        try {
          const cv = window.cv
          
          // Create canvas and load image
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0)
          
          // Convert to OpenCV Mat
          const src = cv.imread(canvas)
          const gray = new cv.Mat()
          const blurred = new cv.Mat()
          const edges = new cv.Mat()
          const hierarchy = new cv.Mat()
          const contours = new cv.MatVector()
          
          // Convert to grayscale
          cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)
          
          // Apply Gaussian blur
          cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0)
          
          // Canny edge detection
          cv.Canny(blurred, edges, 50, 150)
          
          // Dilate edges to close gaps
          const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5))
          cv.dilate(edges, edges, kernel)
          
          // Find contours
          cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
          
          // Find the largest rectangular contour
          let maxArea = 0
          let bestContour = null
          
          for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i)
            const area = cv.contourArea(contour)
            const peri = cv.arcLength(contour, true)
            const approx = new cv.Mat()
            
            cv.approxPolyDP(contour, approx, 0.02 * peri, true)
            
            // Look for quadrilateral (4 points) with significant area
            if (approx.rows === 4 && area > maxArea && area > (img.width * img.height * 0.1)) {
              maxArea = area
              if (bestContour) bestContour.delete()
              bestContour = approx
            } else {
              approx.delete()
            }
          }
          
          if (bestContour && maxArea > 0) {
            console.log('Document border detected, area:', maxArea)
            
            // Get the 4 corner points
            const points = []
            for (let i = 0; i < 4; i++) {
              points.push({
                x: bestContour.data32S[i * 2],
                y: bestContour.data32S[i * 2 + 1]
              })
            }
            
            // Sort points: top-left, top-right, bottom-right, bottom-left
            points.sort((a, b) => a.y - b.y)
            const topPoints = points.slice(0, 2).sort((a, b) => a.x - b.x)
            const bottomPoints = points.slice(2, 4).sort((a, b) => a.x - b.x)
            const sortedPoints = [...topPoints, ...bottomPoints]
            
            // Define destination size (standard passport/ID size ratio)
            const dstWidth = 1000
            const dstHeight = 700
            
            // Source and destination points for perspective transform
            const srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
              sortedPoints[0].x, sortedPoints[0].y,  // top-left
              sortedPoints[1].x, sortedPoints[1].y,  // top-right
              sortedPoints[3].x, sortedPoints[3].y,  // bottom-left
              sortedPoints[2].x, sortedPoints[2].y   // bottom-right
            ])
            
            const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
              0, 0,                    // top-left
              dstWidth, 0,             // top-right
              0, dstHeight,            // bottom-left
              dstWidth, dstHeight      // bottom-right
            ])
            
            // Get perspective transform matrix
            const M = cv.getPerspectiveTransform(srcPoints, dstPoints)
            
            // Apply perspective transform
            const dst = new cv.Mat()
            cv.warpPerspective(src, dst, M, new cv.Size(dstWidth, dstHeight))
            
            // Convert back to canvas
            const outputCanvas = document.createElement('canvas')
            cv.imshow(outputCanvas, dst)
            
            // Clean up
            srcPoints.delete()
            dstPoints.delete()
            M.delete()
            dst.delete()
            bestContour.delete()
            
            const normalizedUrl = outputCanvas.toDataURL('image/jpeg', 0.95)
            console.log('Document normalized successfully')
            resolve(normalizedUrl)
          } else {
            console.log('No document border detected, using original image')
            resolve(imageUrl)
          }
          
          // Clean up
          src.delete()
          gray.delete()
          blurred.delete()
          edges.delete()
          hierarchy.delete()
          contours.delete()
          kernel.delete()
          
        } catch (error) {
          console.error('Document detection error:', error)
          resolve(imageUrl) // Fallback to original
        }
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = imageUrl
    })
  }

  // Document templates with region coordinates (percentage-based for normalized 1000x700 document)
  const documentTemplates = {
    'sa-id': {
      name: 'SA ID Card',
      regions: {
        surname: { x: 0.08, y: 0.35, width: 0.4, height: 0.08 },
        names: { x: 0.08, y: 0.45, width: 0.4, height: 0.08 },
        idNumber: { x: 0.08, y: 0.65, width: 0.5, height: 0.08 },
        dateOfBirth: { x: 0.08, y: 0.75, width: 0.3, height: 0.08 }
      }
    },
    'sa-passport': {
      name: 'SA Passport',
      regions: {
        surname: { x: 0.05, y: 0.16, width: 0.5, height: 0.04 },
        names: { x: 0.05, y: 0.21, width: 0.5, height: 0.04 },
        passportNumber: { x: 0.60, y: 0.16, width: 0.35, height: 0.04 },
        idNumber: { x: 0.05, y: 0.31, width: 0.45, height: 0.04 },
        dateOfBirth: { x: 0.05, y: 0.26, width: 0.25, height: 0.04 }
      }
    },
    'drivers-license': {
      name: 'Driver\'s License',
      regions: {
        surname: { x: 0.35, y: 0.25, width: 0.6, height: 0.08 },
        names: { x: 0.35, y: 0.35, width: 0.6, height: 0.08 },
        idNumber: { x: 0.35, y: 0.45, width: 0.5, height: 0.08 },
        licenseNumber: { x: 0.35, y: 0.15, width: 0.5, height: 0.08 }
      }
    }
  }

  // Show scan regions on image
  const showScanRegions = async () => {
    if (!idDocument) return
    
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw original image
      ctx.drawImage(img, 0, 0)
      
      const template = documentTemplates[documentType]
      const colors = {
        surname: 'rgba(255, 0, 0, 0.3)',
        names: 'rgba(0, 255, 0, 0.3)',
        idNumber: 'rgba(0, 0, 255, 0.3)',
        passportNumber: 'rgba(255, 255, 0, 0.3)',
        dateOfBirth: 'rgba(255, 0, 255, 0.3)',
        licenseNumber: 'rgba(0, 255, 255, 0.3)'
      }
      
      const labels = {
        surname: 'SURNAME',
        names: 'NAMES',
        idNumber: 'ID NUMBER',
        passportNumber: 'PASSPORT #',
        dateOfBirth: 'DATE OF BIRTH',
        licenseNumber: 'LICENSE #'
      }
      
      // Draw each region
      Object.entries(template.regions).forEach(([key, region]) => {
        const x = Math.floor(img.width * region.x)
        const y = Math.floor(img.height * region.y)
        const width = Math.floor(img.width * region.width)
        const height = Math.floor(img.height * region.height)
        
        // Fill region with color
        ctx.fillStyle = colors[key as keyof typeof colors] || 'rgba(128, 128, 128, 0.3)'
        ctx.fillRect(x, y, width, height)
        
        // Draw border
        ctx.strokeStyle = colors[key as keyof typeof colors]?.replace('0.3', '1') || 'rgb(128, 128, 128)'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, width, height)
        
        // Draw label
        ctx.fillStyle = 'white'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 3
        ctx.font = 'bold 14px Arial'
        ctx.strokeText(labels[key as keyof typeof labels] || key.toUpperCase(), x + 5, y + 20)
        ctx.fillText(labels[key as keyof typeof labels] || key.toUpperCase(), x + 5, y + 20)
      })
      
      setRegionPreview(canvas.toDataURL('image/jpeg', 1.0))
      setShowRegions(true)
    }
    img.src = idDocument
  }

  // Extract region from image with visual debugging
  const extractRegion = (imageUrl: string, region: { x: number, y: number, width: number, height: number }, debug = false): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        // Calculate actual pixel coordinates
        const x = Math.floor(img.width * region.x)
        const y = Math.floor(img.height * region.y)
        const width = Math.floor(img.width * region.width)
        const height = Math.floor(img.height * region.height)
        
        if (debug) {
          // Show full image with region highlighted
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          ctx.strokeStyle = 'red'
          ctx.lineWidth = 3
          ctx.strokeRect(x, y, width, height)
          console.log(`Region: x=${x}, y=${y}, width=${width}, height=${height}`)
        } else {
          // Extract only the region
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, x, y, width, height, 0, 0, width, height)
        }
        
        resolve(canvas.toDataURL('image/jpeg', 1.0))
      }
      img.src = imageUrl
    })
  }

  // Google Cloud Vision OCR extraction
  const extractDataFromIDWithTemplate = async (imageUrl: string, docType: 'sa-id' | 'sa-passport' | 'drivers-license') => {
    setExtracting(true)
    setOcrProgress(0)
    
    try {
      setOcrProgress(20)
      
      // Call our API route which uses Google Cloud Vision
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageUrl,
          documentType: docType,
        }),
      })
      
      setOcrProgress(60)
      
      if (!response.ok) {
        throw new Error('OCR request failed')
      }
      
      const data = await response.json()
      
      setOcrProgress(90)
      
      if (data.success && data.extractedData) {
        const { idNumber, firstName, lastName, dateOfBirth, passportNumber } = data.extractedData
        
        console.log('Google Vision extracted:', data.extractedData)
        console.log('Full text:', data.fullText)
        
        setExtractedData({
          idNumber: idNumber || '',
          firstName: firstName || '',
          lastName: lastName || '',
          dateOfBirth: dateOfBirth || '',
          verified: false
        })
      } else {
        // Show empty verification box for manual entry
        setExtractedData({
          idNumber: '',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          verified: false
        })
      }
      
      setOcrProgress(100)
      setShowVerification(true)
      setExtracting(false)
      
    } catch (error) {
      console.error('Google Vision OCR Error:', error)
      setExtracting(false)
      
      // Fallback to showing empty verification box
      setExtractedData({
        idNumber: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        verified: false
      })
      setShowVerification(true)
    }

  // ID Document Handlers
  const handleIdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setDetectingDocument(true)
    
    const reader = new FileReader()
    reader.onloadend = async () => {
      const imageUrl = reader.result as string
      const img = new Image()
      img.onload = async () => {
        // First rotate if needed
        const isVertical = img.height > img.width
        const rotatedUrl = isVertical ? await rotateImage(imageUrl, 90) : imageUrl
        
        // Then detect and normalize document borders
        const normalizedUrl = await detectAndNormalizeDocument(rotatedUrl)
        
        setIdDocument(normalizedUrl)
        updateData({ idDocumentUrl: normalizedUrl })
        setDetectingDocument(false)
        
        // Start template-based OCR extraction
        await extractDataFromIDWithTemplate(normalizedUrl, documentType)
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
        setCameraType('selfie')
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
      setCameraType(null)
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
              {/* Document Type Selector */}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <button
                  onClick={() => idFileInputRef.current?.click()}
                  className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                >
                  Upload {documentTemplates[documentType].name}
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
              {/* Document Detection Progress */}
              {detectingDocument && (
                <div className="bg-purple-50 border border-purple-200 rounded p-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-purple-900">🔍 Detecting document borders...</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-1.5">
                    <div className="bg-purple-600 h-1.5 rounded-full animate-pulse" style={{ width: '70%' }} />
                  </div>
                </div>
              )}
              
              <div className="relative inline-block w-full">
                <img 
                  src={idDocument} 
                  alt="ID Document" 
                  className="w-full max-h-32 rounded object-contain bg-white"
                />
              </div>
              
              {/* OCR Progress */}
              {extracting && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-blue-900">🤖 Google Vision AI extracting data...</span>
                    <span className="text-blue-700">{ocrProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Verification Section */}
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
                      onClick={() => {
                        updateData({
                          idNumber: extractedData.idNumber,
                          firstName: extractedData.firstName,
                          lastName: extractedData.lastName,
                          dateOfBirth: extractedData.dateOfBirth
                        })
                        setExtractedData(prev => ({ ...prev, verified: true }))
                        setShowVerification(false)
                      }}
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
                  onClick={showScanRegions}
                  className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  🔍 Show Regions
                </button>
                <button
                  onClick={() => {
                    setIdDocument(null)
                    setShowVerification(false)
                    setShowRegions(false)
                    setRegionPreview(null)
                    setExtractedData({
                      idNumber: '',
                      firstName: '',
                      lastName: '',
                      dateOfBirth: '',
                      verified: false
                    })
                    updateData({ idDocumentUrl: undefined })
                    idFileInputRef.current?.click()
                  }}
                  className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Change
                </button>
              </div>
              
              {/* Region Preview Modal */}
              {showRegions && regionPreview && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowRegions(false)}>
                  <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-bold">Scan Regions - {documentTemplates[documentType].name}</h3>
                      <button onClick={() => setShowRegions(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                    </div>
                    <img src={regionPreview} alt="Scan Regions" className="w-full rounded" />
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500/30 border-2 border-red-500"></div>
                        <span>Surname</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500/30 border-2 border-green-500"></div>
                        <span>Names</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500/30 border-2 border-blue-500"></div>
                        <span>ID Number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500/30 border-2 border-yellow-500"></div>
                        <span>Passport Number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-500/30 border-2 border-purple-500"></div>
                        <span>Date of Birth</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-cyan-500/30 border-2 border-cyan-500"></div>
                        <span>License Number</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">These colored boxes show where the OCR system is scanning. If the boxes don't align with the actual text, the template coordinates need adjustment.</p>
                    <button onClick={() => setShowRegions(false)} className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Close</button>
                  </div>
                </div>
              )}
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
}