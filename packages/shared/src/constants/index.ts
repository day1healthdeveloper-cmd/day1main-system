// System-wide constants

export const ROLES = {
  MEMBER: 'member',
  EMPLOYER_ADMIN: 'employer_admin',
  BROKER: 'broker',
  CALL_CENTRE_AGENT: 'call_centre_agent',
  CLAIMS_ASSESSOR: 'claims_assessor',
  CLAIMS_SUPERVISOR: 'claims_supervisor',
  PROVIDER_ADMIN: 'provider_admin',
  FINANCE_CLERK: 'finance_clerk',
  FINANCE_MANAGER: 'finance_manager',
  COMPLIANCE_OFFICER: 'compliance_officer',
  DATA_PROTECTION_OFFICER: 'dpo',
  RISK_FRAUD_ANALYST: 'risk_fraud_analyst',
  PRODUCT_MANAGER: 'product_manager',
  ACTUARY: 'actuary',
  SYSTEM_ADMIN: 'system_admin',
  AUDITOR: 'auditor',
} as const

export const PERMISSIONS = {
  // Member permissions
  MEMBER_READ: 'member:read',
  MEMBER_WRITE: 'member:write',
  MEMBER_DELETE: 'member:delete',
  
  // Policy permissions
  POLICY_READ: 'policy:read',
  POLICY_WRITE: 'policy:write',
  POLICY_APPROVE: 'policy:approve',
  
  // Product permissions
  PRODUCT_READ: 'product:read',
  PRODUCT_WRITE: 'product:write',
  PRODUCT_APPROVE: 'product:approve',
  PRODUCT_PUBLISH: 'product:publish',
  
  // Claim permissions
  CLAIM_READ: 'claim:read',
  CLAIM_SUBMIT: 'claim:submit',
  CLAIM_ASSESS: 'claim:assess',
  CLAIM_APPROVE: 'claim:approve',
  
  // Payment permissions
  PAYMENT_READ: 'payment:read',
  PAYMENT_PROCESS: 'payment:process',
  PAYMENT_APPROVE: 'payment:approve',
  
  // Audit permissions
  AUDIT_READ: 'audit:read',
  
  // Compliance permissions
  COMPLIANCE_READ: 'compliance:read',
  COMPLIANCE_WRITE: 'compliance:write',
  
  // System admin permissions
  SYSTEM_ADMIN: 'system:admin',
} as const

export const CURRENCY = {
  ZAR: 'ZAR',
} as const

export const DATA_SUBJECT_REQUEST_TYPES = {
  ACCESS: 'access',
  ERASURE: 'erasure',
  RECTIFICATION: 'rectification',
  PORTABILITY: 'portability',
} as const

export const BREACH_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const
