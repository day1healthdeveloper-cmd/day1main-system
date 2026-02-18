// Application Data Types for Day1Health Onboarding

export interface ApplicationData {
  // Contact/Plan Info
  contactId?: string
  planId?: string
  planName?: string
  planConfig?: 'single' | 'couple' | 'family'
  adults?: number
  children?: number
  monthlyPrice?: number
  
  // Step 1: Personal Info
  firstName: string
  lastName: string
  idNumber: string
  dateOfBirth: string
  gender?: string
  email: string
  mobile: string
  addressLine1: string
  addressLine2?: string
  city: string
  postalCode: string
  
  // Step 2: ID Document
  idDocumentUrl?: string
  idDocumentOcrData?: any
  
  // Step 3: Proof of Address
  proofOfAddressUrl?: string
  proofOfAddressUrls?: string[] // Support multiple documents
  proofOfAddressOcrData?: any
  
  // Step 4: Selfie
  selfieUrl?: string
  faceVerificationResult?: any
  
  // Step 5: Dependents
  dependents?: Dependent[]
  
  // Step 6: Medical History
  medicalHistory?: MedicalHistory
  
  // Step 7: Banking
  bankName?: string
  accountNumber?: string
  branchCode?: string
  accountHolderName?: string
  debitOrderDay?: number
  
  // Step 8: Terms & Marketing Consent
  voiceRecordingUrl?: string
  signatureUrl?: string
  termsAccepted?: boolean
  
  // POPIA Compliance: Marketing Consent
  marketingConsent?: boolean
  marketingConsentDate?: string
  emailConsent?: boolean
  smsConsent?: boolean
  phoneConsent?: boolean
}

export interface Dependent {
  firstName: string
  lastName: string
  idNumber?: string
  dateOfBirth: string
  gender?: string
  relationship: 'spouse' | 'child'
  idDocumentUrl?: string
  birthCertificateUrl?: string
  documentOcrData?: any
}

export interface MedicalHistory {
  hasPreExisting: boolean
  preExistingConditions?: string
  currentMedications?: string
  hasPreviousInsurer: boolean
  previousInsurer?: string
  reasonForSwitching?: string
}

export interface PlanSelection {
  planId: string
  planName: string
  planConfig: 'single' | 'couple' | 'family'
  adults: number
  children: number
  monthlyPrice: number
  coverTypes?: string[]
}
