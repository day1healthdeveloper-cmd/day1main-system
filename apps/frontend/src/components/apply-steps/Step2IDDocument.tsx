'use client'

import { useState, useRef } from 'react'
import { ApplicationData } from '@/types/application'

interface Props {
  data: ApplicationData
  updateData: (data: Partial<ApplicationData>) => void
  nextStep: () => void
  prevStep: () => void
}

export default function Step2IDDocument({ data, updateData, nextStep, prevStep }: Props) {
  const [preview, setPreview] = useState<string | null>(data.idDocumentUrl || null)
  const [rotation, setRotation] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const rotateImage = (imageUrl: string, degrees: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        // Set canvas dimensions based on rotation
        if (degrees === 90 || degrees === 270 || degrees === -90 || degrees === -270) {
          canvas.width = img.height
          canvas.height = img.width
        } else {
          canvas.width = img.width
          canvas.height = img.height
        }
        
        // Rotate and draw
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((degrees * Math.PI) / 180)
        ctx.drawImage(img, -img.width / 2, -img.height / 2)
        
        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }
      img.src = imageUrl
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const imageUrl = reader.result as string
      const img = new Image()
      img.onload = async () => {
        // Check if image is vertical and needs auto-rotation
        const isVertical = img.height > img.width
        if (isVertical) {
          // Rotate 90 degrees to make it horizontal
          const rotatedUrl = await rotateImage(imageUrl, 90)
          setPreview(rotatedUrl)
          updateData({ idDocumentUrl: rotatedUrl })
        } else {
          setPreview(imageUrl)
          updateData({ idDocumentUrl: imageUrl })
        }
        setRotation(0)
      }
      img.src = imageUrl
    }
    reader.readAsDataURL(file)
  }

  const handleRotate = async (direction: 'left' | 'right') => {
    if (!preview) return
    
    const degrees = direction === 'left' ? -90 : 90
    const rotatedUrl = await rotateImage(preview, degrees)
    setPreview(rotatedUrl)
    updateData({ idDocumentUrl: rotatedUrl })
  }

  const handleNext = () => {
    if (!preview) {
      alert('Please upload your ID document')
      return
    }
    nextStep()
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">ID Document</h2>
      <p className="text-xs text-gray-600 mb-2">Upload a clear photo of your South African ID document/passport/drivers license</p>

      <div className="space-y-2">
        <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center">
          {preview ? (
            <div className="space-y-2">
              <div className="relative inline-block">
                <img 
                  src={preview} 
                  alt="ID Document" 
                  className="max-w-full max-h-48 mx-auto rounded object-contain"
                  style={{ display: 'block' }}
                />
              </div>
              <div className="flex gap-2 justify-center items-center">
                <button
                  onClick={() => handleRotate('left')}
                  className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
                  title="Rotate left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Rotate Left
                </button>
                <button
                  onClick={() => handleRotate('right')}
                  className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
                  title="Rotate right"
                >
                  Rotate Right
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Change Photo
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-gray-400">
                <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Upload ID Document
                </button>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-2">
          <h3 className="text-xs font-medium text-blue-900 mb-0.5">Tips: Ensure text is readable • Avoid glare • Capture entire document • Use good lighting</h3>
        </div>

        {data.idDocumentOcrData && (
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <h3 className="text-xs font-medium text-green-900 mb-1">✓ Document verified</h3>
            <p className="text-xs text-green-800">Information extracted successfully</p>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

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
            Next: Proof of Address
          </button>
        </div>
      </div>
    </div>
  )
}
