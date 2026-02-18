'use client'

import { useState, useRef } from 'react'
import { ApplicationData } from '@/types/application'

interface Props {
  data: ApplicationData
  updateData: (data: Partial<ApplicationData>) => void
  nextStep: () => void
  prevStep: () => void
}

export default function Step4Selfie({ data, updateData, nextStep, prevStep }: Props) {
  const [preview, setPreview] = useState<string | null>(data.selfieUrl || null)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setPreview(imageUrl)
      updateData({ selfieUrl: imageUrl })
      stopCamera()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPreview(result)
      updateData({ selfieUrl: result })
    }
    reader.readAsDataURL(file)
  }

  const handleRotate = async (direction: 'left' | 'right') => {
    if (!preview) return
    
    const degrees = direction === 'left' ? -90 : 90
    const rotatedUrl = await rotateImage(preview, degrees)
    setPreview(rotatedUrl)
    updateData({ selfieUrl: rotatedUrl })
  }

  const handleNext = () => {
    if (!preview) {
      alert('Please take a selfie or upload a photo')
      return
    }
    nextStep()
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Selfie Verification</h2>
      <p className="text-xs text-gray-600 mb-2">Take a selfie to verify your identity</p>

      <div className="space-y-2">
        {!preview && !cameraActive && (
          <div className="space-y-1">
            <button
              onClick={startCamera}
              className="w-full px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium"
            >
              📸 Take Selfie
            </button>
            <div className="text-center text-xs text-gray-500">or</div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-3 py-1.5 text-sm border-2 border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
            >
              📁 Upload Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {cameraActive && (
          <div className="space-y-1">
            <div className="relative bg-black rounded overflow-hidden aspect-square max-w-sm mx-auto">
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
                className="flex-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium"
              >
                Capture
              </button>
              <button
                onClick={stopCamera}
                className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {preview && (
          <div className="space-y-1">
            <div className="border-2 border-gray-300 rounded overflow-hidden aspect-square max-w-sm mx-auto">
              <img src={preview} alt="Selfie" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleRotate('left')}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                ↺ Rotate Left
              </button>
              <button
                onClick={() => handleRotate('right')}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Rotate Right ↻
              </button>
            </div>
            <button
              onClick={() => {
                setPreview(null)
                updateData({ selfieUrl: undefined })
              }}
              className="text-green-600 hover:text-green-700 text-sm font-medium block text-center w-full"
            >
              Retake Photo
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <div className="bg-blue-50 border border-blue-200 rounded p-2">
          <h3 className="text-xs font-medium text-blue-900 mb-0.5">Tips: Face camera directly • Remove glasses/hats • Good lighting • Neutral expression • Face clearly visible</h3>
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
