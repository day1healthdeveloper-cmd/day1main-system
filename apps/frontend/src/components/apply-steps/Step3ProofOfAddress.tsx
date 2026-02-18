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

export default function Step3ProofOfAddress({ data, updateData, nextStep, prevStep }: Props) {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || documents.length >= 3) return

    for (let i = 0; i < files.length && documents.length + i < 3; i++) {
      const file = files[i]
      const isPdf = file.type === 'application/pdf'

      if (isPdf) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const newDoc: DocumentItem = {
            url: reader.result as string,
            type: 'pdf',
            name: file.name
          }
          setDocuments(prev => {
            const updated = [...prev, newDoc]
            const urls = updated.map(d => d.url)
            updateData({ 
              proofOfAddressUrl: urls[0],
              proofOfAddressUrls: urls
            })
            return updated
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
            setDocuments(prev => {
              const updated = [...prev, newDoc]
              const urls = updated.map(d => d.url)
              updateData({ 
                proofOfAddressUrl: urls[0],
                proofOfAddressUrls: urls
              })
              return updated
            })
          }
          img.src = imageUrl
        }
        reader.readAsDataURL(file)
      }
    }
    
    e.target.value = ''
  }

  const handleRotate = async (index: number, direction: 'left' | 'right') => {
    const doc = documents[index]
    if (doc.type !== 'image') return
    
    const degrees = direction === 'left' ? -90 : 90
    const rotatedUrl = await rotateImage(doc.url, degrees)
    
    setDocuments(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], url: rotatedUrl }
      const urls = updated.map(d => d.url)
      updateData({ 
        proofOfAddressUrl: urls[0],
        proofOfAddressUrls: urls
      })
      return updated
    })
  }

  const handleDelete = (index: number) => {
    setDocuments(prev => {
      const updated = prev.filter((_, i) => i !== index)
      const urls = updated.map(d => d.url)
      updateData({ 
        proofOfAddressUrl: urls[0] || undefined,
        proofOfAddressUrls: urls.length > 0 ? urls : undefined
      })
      return updated
    })
  }

  const handleNext = () => {
    if (documents.length === 0) {
      alert('Please upload at least one proof of address document')
      return
    }
    nextStep()
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Proof of Address</h2>
      <p className="text-xs text-gray-600 mb-2">Upload up to 3 documents (utility bill or bank statement, max 3 months old)</p>

      <div className="space-y-2">
        {documents.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {documents.map((doc, index) => (
              <div key={index} className="relative border-2 border-green-500 rounded p-2 bg-green-50">
                {doc.type === 'image' ? (
                  <>
                    <img 
                      src={doc.url} 
                      alt={doc.name} 
                      className="w-full h-24 object-cover rounded mb-1"
                    />
                    <p className="text-xs text-center text-green-700 font-medium mb-1 truncate" title={doc.name}>{doc.name}</p>
                  </>
                ) : (
                  <>
                    <div className="w-full h-24 bg-red-100 rounded flex flex-col items-center justify-center mb-1">
                      <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-red-700 font-medium mt-1">PDF</p>
                    </div>
                    <p className="text-xs text-center text-green-700 font-medium mb-1 truncate" title={doc.name}>{doc.name}</p>
                  </>
                )}
                <div className="flex gap-1">
                  {doc.type === 'image' && (
                    <>
                      <button
                        onClick={() => handleRotate(index, 'left')}
                        className="flex-1 px-1 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
                        title="Rotate left"
                      >
                        ↺
                      </button>
                      <button
                        onClick={() => handleRotate(index, 'right')}
                        className="flex-1 px-1 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
                        title="Rotate right"
                      >
                        ↻
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(index)}
                    className={`${doc.type === 'image' ? 'flex-1' : 'w-full'} px-1 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {documents.length < 3 && (
          <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center">
            <div className="space-y-2">
              <div className="text-gray-400">
                <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Upload Document ({documents.length}/3)
              </button>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded p-2">
          <h3 className="text-xs font-medium text-blue-900 mb-0.5">Acceptable: Utility bill • Bank statement • Lease agreement • Max 3 months old • Must show name & address</h3>
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
            Next: Selfie Verification
          </button>
        </div>
      </div>
    </div>
  )
}
