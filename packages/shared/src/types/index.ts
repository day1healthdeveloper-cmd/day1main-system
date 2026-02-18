// Common types used across Day1Main

export type Regime = 'medical_scheme' | 'insurance'

export type PolicyStatus = 'active' | 'lapsed' | 'cancelled' | 'pending'

export type ClaimStatus = 'submitted' | 'validated' | 'adjudicated' | 'approved' | 'pended' | 'rejected' | 'paid'

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

export type PaymentMethod = 'debit_order' | 'card' | 'eft' | 'cash'

export type Gender = 'male' | 'female' | 'other'

export type KYCStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export type MandateStatus = 'active' | 'expired' | 'cancelled' | 'suspended'

export type BillingFrequency = 'monthly' | 'quarterly' | 'annually'

export type ProductStatus = 'draft' | 'pending_approval' | 'approved' | 'published' | 'archived'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export type AdjudicationDecision = 'approved' | 'pended' | 'rejected' | 'partial'

export interface Money {
  amount: number
  currency: string
}

export interface Address {
  line1: string
  line2?: string
  city: string
  province: string
  postal_code: string
  country: string
}

export interface AuditMetadata {
  created_by: string
  created_at: Date
  updated_by?: string
  updated_at?: Date
}
