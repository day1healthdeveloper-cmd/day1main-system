'use client'

import { useState, useEffect, useRef } from 'react'
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
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { DropdownNavProps, DropdownProps } from "react-day-picker"

interface Props {
  data: ApplicationData
  updateData: (data: Partial<ApplicationData>) => void
  nextStep: () => void
}

export default function Step1Plus1Confirm({ data, updateData, nextStep }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [memberFound, setMemberFound] = useState(false)
  const [coverPlanName, setCoverPlanName] = useState('')
  const [coverPlanPrice, setCoverPlanPrice] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)
  
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

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleMemberSearch = async () => {
    if (!searchQuery.trim()) return
    
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    setSearching(true)
    abortControllerRef.current = new AbortController()
    
    try {
      // Search for member by mobile number in Plus1Rewards database (for new applications)
      const response = await fetch(
        `/api/plus1/search-application-member?mobile=${encodeURIComponent(searchQuery)}`,
        { signal: abortControllerRef.current.signal }
      )
      
      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Search API error:', errorData)
        alert('Failed to search for member. Please try again.')
        setSearching(false)
        return
      }
      
      const result = await response.json()
      
      if (result.found && result.member) {
        const member = result.member
        
        // Populate form with member data
        setFormData({
          firstName: member.firstName || '',
          lastName: member.lastName || '',
          idNumber: member.idNumber || '',
          dateOfBirth: member.dateOfBirth || '',
          gender: member.gender || '',
          email: member.email || '',
          mobile: member.mobile || '',
          addressLine1: member.addressLine1 || '',
          addressLine2: '',
          city: member.city || '',
          postalCode: member.postalCode || '',
        })
        
        if (member.dateOfBirth) {
          setDate(new Date(member.dateOfBirth))
        }
        
        setCoverPlanName(member.coverPlanName || '')
        setCoverPlanPrice(member.coverPlanPrice || '')
        setMemberFound(true)
        
        // Update parent with cover plan name and price
        updateData({ 
          planName: member.coverPlanName || '',
          monthlyPrice: member.coverPlanPrice ? parseFloat(member.coverPlanPrice) : undefined,
        })
      } else if (result.existingMember) {
        // Member already exists in Day1Main
        alert(`Member already exists in Day1Main database.\n\nMember: ${result.existingMember.name}\nMember Number: ${result.existingMember.memberNumber}\n\nPlease use the upgrade process instead of applying again.`)
        setMemberFound(false)
      } else {
        alert('Member not found in Plus1Rewards. Please check the mobile number and try again.')
        setMemberFound(false)
      }
      setSearching(false)
    } catch (error) {
      // Ignore abort errors during development hot reload
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Search aborted')
        return
      }
      console.error('Member search error:', error)
      alert('Failed to search for member. Please try again.')
      setSearching(false)
    }
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
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src="/Logo.jpg" alt="Day1Health" style={{ height: '78px', width: 'auto' }} />
          <h2 className="text-lg font-bold">Plus 1 Member Confirmation</h2>
        </div>
      </div>
      
      {/* Plus 1 Member Search */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <label className="block text-sm font-semibold text-gray-800 mb-2">Plus 1 Member Search</label>
        <p className="text-xs text-gray-600 mb-3">Enter your cell number here to begin</p>
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMemberSearch()}
              placeholder="Enter plus 1 member mobile number"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-2">
            <button
              type="button"
              onClick={handleMemberSearch}
              disabled={searching || !searchQuery.trim()}
              className="w-full px-6 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
          <div className="col-span-3">
            <input
              type="text"
              value={coverPlanName}
              readOnly
              disabled
              placeholder="Cover Plan Name"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div className="col-span-2">
            <input
              type="text"
              value={coverPlanPrice ? `R${coverPlanPrice}` : ''}
              readOnly
              disabled
              placeholder="Amount"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
        {memberFound && (
          <p className="text-xs text-green-600 mt-2 font-medium">✓ Member found! Details loaded below.</p>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">First Name *</label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              readOnly 
              disabled
              required 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Last Name *</label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              readOnly 
              disabled
              required 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">ID Number/Passport Number *</label>
            <input 
              type="text" 
              name="idNumber" 
              value={formData.idNumber} 
              readOnly 
              disabled
              required 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Date of Birth *</label>
            <input 
              type="text" 
              value={date ? format(date, "PPP") : ''} 
              readOnly 
              disabled
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">Gender</label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled
              className={`flex-1 px-4 py-1.5 text-sm rounded border cursor-not-allowed ${
                formData.gender === 'male'
                  ? 'bg-gray-200 text-gray-600 border-gray-300'
                  : 'bg-gray-100 text-gray-400 border-gray-200'
              }`}
            >
              Male
            </button>
            <button
              type="button"
              disabled
              className={`flex-1 px-4 py-1.5 text-sm rounded border cursor-not-allowed ${
                formData.gender === 'female'
                  ? 'bg-gray-200 text-gray-600 border-gray-300'
                  : 'bg-gray-100 text-gray-400 border-gray-200'
              }`}
            >
              Female
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Email *</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              readOnly 
              disabled
              required 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Mobile *</label>
            <input 
              type="tel" 
              name="mobile" 
              value={formData.mobile} 
              readOnly 
              disabled
              required 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">Address Line 1 *</label>
          <input 
            type="text" 
            name="addressLine1" 
            value={formData.addressLine1} 
            readOnly 
            disabled
            required 
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed" 
          />
        </div>

        <div className="grid grid-cols-12 gap-2 items-end pb-10">
          <div className="col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">City *</label>
            <input 
              type="text" 
              name="city" 
              value={formData.city} 
              readOnly 
              disabled
              required 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed" 
            />
          </div>
          <div className="col-span-3">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Postal Code *</label>
            <input 
              type="text" 
              name="postalCode" 
              value={formData.postalCode} 
              readOnly 
              disabled
              required 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed" 
            />
          </div>
          <div className="col-span-5">
            <button 
              type="submit" 
              disabled={!memberFound}
              className="w-full px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next: ID Document
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
