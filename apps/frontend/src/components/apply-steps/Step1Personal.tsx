/**
 * Step 1 of 6: Personal Information
 * 
 * Collects basic personal details and contact information.
 * Features:
 * - Personal details form (name, ID, DOB, gender, contact)
 * - 📷 Scan ID button - Uses Google Cloud Vision API for instant data extraction
 * - Auto-population from ID number (DOB and gender)
 * - ⏱️ 1-minute timer with confetti celebration
 * - Address information
 * - Automatic lead capture to database
 * 
 * Part of Day1Health 6-step application flow
 */

'use client'

import { useState, useEffect, memo, useCallback, useRef } from 'react'
import { ApplicationData } from '@/types/application'
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { DropdownNavProps, DropdownProps } from "react-day-picker"

// Separate Timer Component to prevent re-renders affecting the form
const CountdownTimer = memo(({ onTimeUpdate }: { onTimeUpdate: (time: number) => void }) => {
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1
        onTimeUpdate(newTime)
        return newTime
      })
    }, 1200) // 1.2 seconds per tick (20% slower)

    return () => clearInterval(timer)
  }, [timeLeft, onTimeUpdate])

  return (
    <div className="flex flex-col items-center gap-2" style={{ marginTop: '8px' }}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center border border-white/50 shadow-lg">
          <img src="/clock48.png" alt="Clock" className="w-[80%] h-[80%]" />
        </div>
        <span className="text-gray-900 font-bold" style={{ fontSize: '20px' }}>{timeLeft}</span>
      </div>
      <p className="text-xs text-gray-600">
        <span className="text-emerald-400 font-bold">ONE</span> minute registration
      </p>
    </div>
  )
})

CountdownTimer.displayName = 'CountdownTimer'

// Confetti Component
const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: '10px',
            height: '10px',
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${2 + Math.random()}s`,
          }}
        />
      ))}
    </div>
  )
}

interface Props {
  data: ApplicationData
  updateData: (data: Partial<ApplicationData>) => void
  nextStep: () => void
}

export default function Step1Personal({ data, updateData, nextStep }: Props) {
  const [formData, setFormData] = useState({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    idNumber: data.idNumber || '',
    dateOfBirth: data.dateOfBirth || '',
    gender: data.gender || '',
    email: data.email || '',
    mobile: data.mobile || '',
    addressLine1: data.addressLine1 || '',
    addressLine2: data.addressLine2 || '',
    city: data.city || '',
    postalCode: data.postalCode || '',
  })

  const [date, setDate] = useState<Date | undefined>(
    formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined
  )

  // State to control calendar popover
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  
  // State to control number pad
  const [isNumberPadOpen, setIsNumberPadOpen] = useState(false)
  const [showIdScanner, setShowIdScanner] = useState(false)
  const [scanningId, setScanningId] = useState(false)
  const idScanInputRef = useRef<HTMLInputElement>(null)
  
  // Track timer value using ref to avoid re-renders
  const currentTimeRef = useRef(60)
  const [showCongrats, setShowCongrats] = useState(false)

  const handleTimeUpdate = useCallback((time: number) => {
    currentTimeRef.current = time
  }, [])

  const handleNumberPadClick = (num: string) => {
    if (num === 'backspace') {
      setFormData(prev => ({ ...prev, idNumber: prev.idNumber.slice(0, -1) }))
    } else if (num === 'clear') {
      setFormData(prev => ({ ...prev, idNumber: '' }))
    } else if (formData.idNumber.length < 13) {
      const newIdNumber = formData.idNumber + num
      setFormData(prev => ({ ...prev, idNumber: newIdNumber }))
      
      // Auto-populate when ID number is complete
      if (newIdNumber.length === 13) {
        autoPopulateFromId(newIdNumber)
      }
    }
  }

  const autoPopulateFromId = (idNumber: string) => {
    // Extract date of birth (YYMMDD)
    const year = idNumber.substring(0, 2)
    const month = idNumber.substring(2, 4)
    const day = idNumber.substring(4, 6)
    
    // Determine century (if year > current year's last 2 digits, it's 1900s, else 2000s)
    const currentYear = new Date().getFullYear()
    const currentYearLastTwo = currentYear % 100
    const fullYear = parseInt(year) > currentYearLastTwo ? `19${year}` : `20${year}`
    
    const birthDate = new Date(`${fullYear}-${month}-${day}`)
    
    // Extract gender (digits 7-10: 0000-4999 = Female, 5000-9999 = Male)
    const genderDigits = parseInt(idNumber.substring(6, 10))
    const gender = genderDigits < 5000 ? 'female' : 'male'
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      dateOfBirth: `${fullYear}-${month}-${day}`,
      gender: gender
    }))
    
    // Update date picker
    setDate(birthDate)
  }

  const handleIdScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScanningId(true)
    
    const reader = new FileReader()
    reader.onloadend = async () => {
      const imageUrl = reader.result as string
      
      try {
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imageUrl,
            documentType: 'sa-id',
          }),
        })
        
        if (!response.ok) {
          throw new Error('OCR request failed')
        }
        
        const result = await response.json()
        
        if (result.success && result.extractedData) {
          const extracted = result.extractedData
          
          setFormData(prev => ({
            ...prev,
            idNumber: extracted.idNumber || prev.idNumber,
            firstName: extracted.firstName || prev.firstName,
            lastName: extracted.lastName || prev.lastName,
            dateOfBirth: extracted.dateOfBirth || prev.dateOfBirth,
          }))
          
          if (extracted.dateOfBirth) {
            setDate(new Date(extracted.dateOfBirth))
          }
          
          // Extract gender from ID if available
          if (extracted.idNumber && extracted.idNumber.length === 13) {
            const genderDigits = parseInt(extracted.idNumber.substring(6, 10))
            const gender = genderDigits < 5000 ? 'female' : 'male'
            setFormData(prev => ({ ...prev, gender }))
          }
        }
        
        setScanningId(false)
        setShowIdScanner(false)
        
      } catch (error) {
        console.error('ID Scan Error:', error)
        alert('Failed to scan ID. Please try again or enter manually.')
        setScanningId(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd')
      setFormData(prev => ({ ...prev, dateOfBirth: formattedDate }))
    }
  }

  const handleCalendarChange = (
    _value: string | number,
    _e: React.ChangeEventHandler<HTMLSelectElement>,
  ) => {
    const _event = {
      target: {
        value: String(_value),
      },
    } as React.ChangeEvent<HTMLSelectElement>
    _e(_event)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateData(formData)
    
    // Check if completed in under 1 minute
    if (currentTimeRef.current > 0) {
      setShowCongrats(true)
      setTimeout(() => {
        setShowCongrats(false)
      }, 4000)
    }
    
    // Save lead to database immediately after Step 1
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          mobile: formData.mobile,
          idNumber: formData.idNumber,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          postalCode: formData.postalCode,
          source: 'website_application',
          lifecycleStage: 'application_started',
        }),
      })
      // Continue to next step even if save fails (don't block user)
    } catch (error) {
      console.error('Failed to save lead:', error)
      // Continue anyway
    }
    
    nextStep()
  }

  return (
    <div>
      {/* Congratulations Popup */}
      {showCongrats && (
        <>
          <Confetti />
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center animate-bounce-in">
              <div className="text-6xl mb-4">😊</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Congratulations!</h2>
              <p className="text-gray-700 text-lg mb-2">You registered in just 1 minute!</p>
              <p className="text-gray-600 text-base">Let's continue with your application...</p>
            </div>
          </div>
        </>
      )}
      
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3" style={{ marginTop: '0px' }}>
          <img src="/Logo.jpg" alt="Day1Health" style={{ height: '78px', width: 'auto' }} />
          <h2 className="text-lg font-bold">Personal Information</h2>
        </div>
        
        {/* 1 Minute Countdown Timer - Exact Hero Section Style */}
        <CountdownTimer onTimeUpdate={handleTimeUpdate} />
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">First Name *</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Last Name *</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <div className="flex items-center justify-between mb-0.5">
              <label className="block text-xs font-medium text-gray-700">ID Number *</label>
              <button
                type="button"
                onClick={() => setShowIdScanner(true)}
                className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                📷 Scan ID
              </button>
            </div>
            <input 
              type="text" 
              name="idNumber" 
              value={formData.idNumber} 
              onClick={() => setIsNumberPadOpen(true)}
              readOnly
              required 
              maxLength={13} 
              placeholder="Click to enter ID"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 cursor-pointer" 
            />
            
            {/* Number Pad Popup */}
            {isNumberPadOpen && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20" onClick={() => setIsNumberPadOpen(false)}>
                <div className="bg-white rounded-xl shadow-2xl p-6 w-80" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Enter ID Number</h3>
                    <button 
                      type="button"
                      onClick={() => setIsNumberPadOpen(false)}
                      className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-center text-xl font-mono tracking-wider">
                      {formData.idNumber || '_ _ _ _ _ _ _ _ _ _ _ _ _'}
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-1">
                      {formData.idNumber.length}/13 digits
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleNumberPadClick(String(num))}
                        className="h-12 bg-white border-2 border-gray-300 rounded-lg text-lg font-semibold hover:bg-green-50 hover:border-green-500 transition-colors"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleNumberPadClick('clear')}
                      className="h-12 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold hover:bg-red-50 hover:border-red-500 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNumberPadClick('0')}
                      className="h-12 bg-white border-2 border-gray-300 rounded-lg text-lg font-semibold hover:bg-green-50 hover:border-green-500 transition-colors"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNumberPadClick('backspace')}
                      className="h-12 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold hover:bg-yellow-50 hover:border-yellow-500 transition-colors"
                    >
                      ⌫
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setIsNumberPadOpen(false)}
                    disabled={formData.idNumber.length !== 13}
                    className={`w-full mt-4 py-3 rounded-lg font-semibold transition-colors ${
                      formData.idNumber.length === 13
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Date of Birth *</label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal h-8 px-2 text-sm ${!date && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={5} avoidCollisions={false}>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  captionLayout="dropdown"
                  defaultMonth={new Date(1990, 0)}
                  startMonth={new Date(1900, 0)}
                  endMonth={new Date()}
                  hideNavigation
                  components={{
                    DropdownNav: (props: DropdownNavProps) => {
                      return <div className="flex w-full items-center gap-2">{props.children}</div>
                    },
                    Dropdown: (props: DropdownProps) => {
                      return (
                        <Select
                          value={String(props.value)}
                          onValueChange={(value) => {
                            if (props.onChange) {
                              handleCalendarChange(value, props.onChange)
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 w-fit font-medium first:grow">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                            {props.options?.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={String(option.value)}
                                disabled={option.disabled}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                    },
                  }}
                />
                <div className="p-3 border-t">
                  <Button
                    type="button"
                    onClick={() => setIsCalendarOpen(false)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">Gender</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
              className={`flex-1 px-4 py-1.5 text-sm rounded border transition-colors ${
                formData.gender === 'male'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
              className={`flex-1 px-4 py-1.5 text-sm rounded border transition-colors ${
                formData.gender === 'female'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
              }`}
            >
              Female
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Mobile *</label>
            <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required pattern="[0-9]{10}" className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">Address Line 1 *</label>
          <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required placeholder="Street address" className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500" />
        </div>

        <div className="grid grid-cols-12 gap-2 items-end pb-10">
          <div className="col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">City *</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500" />
          </div>
          <div className="col-span-3">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Postal Code *</label>
            <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required pattern="[0-9]{4}" className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500" />
          </div>
          <div className="col-span-5">
            <button type="submit" className="w-full px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 font-medium">
              Next: ID Document
            </button>
          </div>
        </div>
      </form>

      {/* ID Scanner Modal */}
      {showIdScanner && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" onClick={() => setShowIdScanner(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">📷 Scan ID Document</h3>
              <button 
                type="button"
                onClick={() => setShowIdScanner(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            {scanningId ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">🤖 Scanning with Google Vision AI...</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Take a photo of your SA ID card to automatically fill in your details.
                </p>
                <button
                  onClick={() => idScanInputRef.current?.click()}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  📸 Take Photo / Upload
                </button>
                <input
                  ref={idScanInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleIdScan}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Make sure the ID is well-lit and all text is visible
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
