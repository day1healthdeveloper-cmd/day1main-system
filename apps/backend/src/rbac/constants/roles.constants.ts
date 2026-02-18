/**
 * System-wide role definitions
 */

export const ROLES = {
  MEMBER: 'member',
  EMPLOYER_ADMIN: 'employer_admin',
  BROKER: 'broker',
  CALL_CENTRE_AGENT: 'call_centre_agent',
  AMBULANCE_OPERATOR: 'ambulance_operator',
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
  OPERATIONS_MANAGER: 'operations_manager',
  SYSTEM_ADMIN: 'system_admin',
  AUDITOR: 'auditor',
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS = {
  [ROLES.MEMBER]: 'Member with access to member portal',
  [ROLES.EMPLOYER_ADMIN]: 'Employer administrator for group schemes',
  [ROLES.BROKER]: 'Broker/intermediary selling policies',
  [ROLES.CALL_CENTRE_AGENT]: 'Call centre agent for customer support',
  [ROLES.AMBULANCE_OPERATOR]: 'Ambulance operator for emergency transport verification',
  [ROLES.CLAIMS_ASSESSOR]: 'Claims assessor for processing claims',
  [ROLES.CLAIMS_SUPERVISOR]: 'Claims supervisor with approval authority',
  [ROLES.PROVIDER_ADMIN]: 'Healthcare provider administrator',
  [ROLES.FINANCE_CLERK]: 'Finance clerk for payment processing',
  [ROLES.FINANCE_MANAGER]: 'Finance manager with approval authority',
  [ROLES.COMPLIANCE_OFFICER]: 'Compliance officer for regulatory compliance',
  [ROLES.DATA_PROTECTION_OFFICER]: 'Data Protection Officer for POPIA compliance',
  [ROLES.RISK_FRAUD_ANALYST]: 'Risk and fraud analyst',
  [ROLES.PRODUCT_MANAGER]: 'Product manager for product development',
  [ROLES.ACTUARY]: 'Actuary for pricing and risk analysis',
  [ROLES.OPERATIONS_MANAGER]: 'Operations manager for daily business operations',
  [ROLES.SYSTEM_ADMIN]: 'System administrator with full access',
  [ROLES.AUDITOR]: 'Auditor with read-only access',
} as const
