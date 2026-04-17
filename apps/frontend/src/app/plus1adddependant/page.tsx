'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface MemberData {
  memberId: string
  memberNumber: string
  firstName: string
  lastName: string
  email: string
  mobile: string
  currentPlan: string
  currentPremium: number
  brokerCode: string
}

export default function Plus1AddDependantPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Step 1: Member search
  const [mobile, setMobile] = useState('')
  const [memberData, setMemberData] = useState<MemberData | null>(null)
  
  // Step 2: Dependant details
  const [dependantData, setDependantData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    dateOfBirth: '',
    gender: '',
    relationship: ''
  })
  
  // Step 3: Documents
  const [documents, setDocuments] = useState({
    idDocument: null as File | null
  })
  
  const [documentUrls, setDocumentUrls] = useState({
    idDocumentUrl: ''
  })
  
  // Premium calculation
  const [dependantCost, setDependantCost] = useState(0)

  // Parse South African ID number to extract DOB and gender
  const parseIdNumber = (idNumber: string) => {
    // SA ID format: YYMMDD SSSS C A Z
    // YY = Year, MM = Month, DD = Day
    // SSSS = Sequence (0000-4999 = Female, 5000-9999 = Male)
    // C = Citizenship, A = Race (obsolete), Z = Checksum
    
    if (idNumber.length !== 13) return null

    try {
      const year = idNumber.substring(0, 2)
      const month = idNumber.substring(2, 4)
      const day = idNumber.substring(4, 6)
      const genderCode = parseInt(idNumber.substring(6, 10))

      // Determine century (if year > current year's last 2 digits, it's 1900s, else 2000s)
      const currentYear = new Date().getFullYear()
      const currentYearShort = currentYear % 100
      const fullYear = parseInt(year) > currentYearShort ? `19${year}` : `20${year}`

      // Format date as YYYY-MM-DD
      const dateOfBirth = `${fullYear}-${month}-${day}`

      // Determine gender (0000-4999 = Female, 5000-9999 = Male)
      const gender = genderCode < 5000 ? 'female' : 'male'

      return { dateOfBirth, gender }
    } catch (error) {
      console.error('Error parsing ID number:', error)
      return null
    }
  }

  const handleIdNumberChange = (idNumber: string) => {
    setDependantData({...dependantData, idNumber})

    // Auto-populate DOB and gender if ID is 13 digits
    if (idNumber.length === 13) {
      const parsed = parseIdNumber(idNumber)
      if (parsed) {
        setDependantData({
          ...dependantData,
          idNumber,
          dateOfBirth: parsed.dateOfBirth,
          gender: parsed.gender
        })
      }
    }
  }

  const handleRelationshipChange = async (relationship: string) => {
    setDependantData({...dependantData, relationship})
    
    // Calculate dependant cost based on relationship and plan
    if (memberData) {
      try {
        const planPricing = await fetch('/plan-dependant-pricing.json').then(r => r.json())
        const pricing = planPricing[memberData.currentPlan]
        
        if (pricing) {
          if (relationship === 'spouse' || relationship === 'partner') {
            setDependantCost(pricing.spouse_cost)
          } else if (relationship === 'child') {
            setDependantCost(pricing.child_cost)
          }
        } else {
          // If plan not found in pricing file, show error
          console.error('Plan not found in pricing data:', memberData.currentPlan)
          alert(`Pricing data not found for plan: ${memberData.currentPlan}. Please contact support.`)
          setDependantCost(0)
        }
      } catch (error) {
        console.error('Error loading pricing:', error)
        alert('Failed to load pricing data. Please try again.')
        setDependantCost(0)
      }
    }
  }

  const searchMember = async () => {
    if (!mobile) {
      setError('Please enter a mobile number')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/plus1/search-member?mobile=${encodeURIComponent(mobile)}`)
      const data = await response.json()

      if (!response.ok || !data.found) {
        setError(data.message || 'Member not found. Please ensure you have an active Plus1Rewards membership.')
        return
      }

      setMemberData(data.member)
      
      // Calculate dependant cost based on plan and relationship
      const planPricing = await fetch('/plan-dependant-pricing.json').then(r => r.json())
      const planName = data.member.currentPlan
      const pricing = planPricing[planName]
      
      if (pricing) {
        // Will be updated when relationship is selected
        setDependantCost(0)
      } else {
        // If plan not found, show error
        console.error('Plan not found in pricing data:', planName)
        alert(`Pricing data not found for plan: ${planName}. Please contact support.`)
        setDependantCost(0)
      }
      
      setStep(2)
    } catch (err) {
      setError('Failed to search for member. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const uploadDocument = async (file: File, type: string): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'applications')
    formData.append('folder', `dependants/${memberData?.memberNumber}/${type}`)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Failed to upload ${type}`)
    }

    const data = await response.json()
    return data.url
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Upload document
      let idDocUrl = documentUrls.idDocumentUrl

      if (documents.idDocument) {
        idDocUrl = await uploadDocument(documents.idDocument, 'id-document')
      }

      // Submit dependant request
      const response = await fetch('/api/plus1/add-dependant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobile,
          dependant_first_name: dependantData.firstName,
          dependant_last_name: dependantData.lastName,
          dependant_id_number: dependantData.idNumber,
          dependant_date_of_birth: dependantData.dateOfBirth,
          dependant_gender: dependantData.gender,
          dependant_relationship: dependantData.relationship,
          id_document_url: idDocUrl,
          birth_certificate_url: null,
          marriage_certificate_url: null,
          current_premium: memberData?.currentPremium || 0,
          dependant_cost: dependantCost,
          new_premium: (memberData?.currentPremium || 0) + dependantCost
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit dependant request')
      }

      // Success - redirect to confirmation page
      router.push(`/plus1adddependant/success?ref=${data.request_id}&newPremium=${(memberData?.currentPremium || 0) + dependantCost}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Add Dependant to Your Cover
          </h1>
          <p className="text-gray-600">
            Add a spouse, partner, or child to your Plus1Rewards medical cover
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <div className={`w-16 h-1 ${step >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              4
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: Member Search */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Find Your Membership</CardTitle>
              <CardDescription>Enter your Plus1Rewards mobile number</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="0821234567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Button
                  onClick={searchMember}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Searching...' : 'Continue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Dependant Details */}
        {step === 2 && memberData && (
          <Card>
            <CardHeader>
              <CardTitle>Dependant Information</CardTitle>
              <CardDescription>
                Adding dependant to {memberData.firstName} {memberData.lastName}'s cover
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={dependantData.firstName}
                      onChange={(e) => setDependantData({...dependantData, firstName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={dependantData.lastName}
                      onChange={(e) => setDependantData({...dependantData, lastName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Number *
                  </label>
                  <input
                    type="text"
                    value={dependantData.idNumber}
                    onChange={(e) => handleIdNumberChange(e.target.value)}
                    placeholder="0001015800084"
                    maxLength={13}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Date of birth and gender will be auto-filled from ID number
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={dependantData.dateOfBirth}
                    onChange={(e) => setDependantData({...dependantData, dateOfBirth: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    required
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-filled from ID number
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    value={dependantData.gender}
                    onChange={(e) => setDependantData({...dependantData, gender: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    required
                    disabled
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-filled from ID number
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship *
                  </label>
                  <select
                    value={dependantData.relationship}
                    onChange={(e) => handleRelationshipChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="partner">Partner</option>
                    <option value="child">Child</option>
                  </select>
                </div>

                {/* Show calculated cost */}
                {dependantCost > 0 && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Dependant Cost ({memberData?.currentPlan}):</strong> R{dependantCost.toFixed(2)}/month
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      New Premium: R{((memberData?.currentPremium || 0) + dependantCost).toFixed(2)}/month
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!dependantData.firstName || !dependantData.lastName || !dependantData.idNumber || !dependantData.dateOfBirth || !dependantData.gender || !dependantData.relationship}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>Required documents for verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Document / Passport *
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setDocuments({idDocument: e.target.files?.[0] || null})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a clear photo or scan of the dependant's ID document or passport
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    disabled={!documents.idDocument}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && memberData && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>Please review the details before submitting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Member Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Member Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {memberData.firstName} {memberData.lastName}</p>
                    <p><span className="font-medium">Mobile:</span> {memberData.mobile}</p>
                    <p><span className="font-medium">Current Plan:</span> {memberData.currentPlan}</p>
                  </div>
                </div>

                {/* Dependant Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Dependant Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {dependantData.firstName} {dependantData.lastName}</p>
                    <p><span className="font-medium">ID Number:</span> {dependantData.idNumber}</p>
                    <p><span className="font-medium">Date of Birth:</span> {dependantData.dateOfBirth}</p>
                    <p><span className="font-medium">Gender:</span> {dependantData.gender}</p>
                    <p><span className="font-medium">Relationship:</span> {dependantData.relationship}</p>
                  </div>
                </div>

                {/* Premium Summary */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Premium Summary</h3>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Premium ({memberData.currentPlan}):</span>
                      <span className="font-medium">R{memberData.currentPremium.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Dependant Cost ({dependantData.relationship}):</span>
                      <span className="font-medium">+R{dependantCost.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold text-lg">
                      <span>New Premium:</span>
                      <span className="text-blue-600">R{(memberData.currentPremium + dependantCost).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Our call centre will contact you to verify these details before the dependant is added to your cover.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
