/**
 * System-wide permission definitions
 * Format: resource:action
 */

export const PERMISSIONS = {
  // System Administration
  SYSTEM_ADMIN: 'system:admin',

  // Member Permissions
  MEMBER_READ: 'member:read',
  MEMBER_WRITE: 'member:write',
  MEMBER_DELETE: 'member:delete',
  MEMBER_KYC: 'member:kyc',

  // Policy Permissions
  POLICY_READ: 'policy:read',
  POLICY_WRITE: 'policy:write',
  POLICY_APPROVE: 'policy:approve',
  POLICY_DELETE: 'policy:delete',

  // Product Permissions
  PRODUCT_READ: 'product:read',
  PRODUCT_WRITE: 'product:write',
  PRODUCT_APPROVE: 'product:approve',
  PRODUCT_PUBLISH: 'product:publish',
  PRODUCT_DELETE: 'product:delete',

  // Benefit Rules Permissions
  BENEFIT_RULES_READ: 'benefit_rules:read',
  BENEFIT_RULES_WRITE: 'benefit_rules:write',
  BENEFIT_RULES_APPROVE: 'benefit_rules:approve',

  // Claim Permissions
  CLAIM_READ: 'claim:read',
  CLAIM_SUBMIT: 'claim:submit',
  CLAIM_ASSESS: 'claim:assess',
  CLAIM_APPROVE: 'claim:approve',
  CLAIM_REJECT: 'claim:reject',
  CLAIM_APPEAL: 'claim:appeal',

  // Provider Permissions
  PROVIDER_READ: 'provider:read',
  PROVIDER_WRITE: 'provider:write',
  PROVIDER_APPROVE: 'provider:approve',
  PROVIDER_DELETE: 'provider:delete',

  // Payment Permissions
  PAYMENT_READ: 'payment:read',
  PAYMENT_PROCESS: 'payment:process',
  PAYMENT_APPROVE: 'payment:approve',
  PAYMENT_REFUND: 'payment:refund',

  // Finance Permissions
  FINANCE_READ: 'finance:read',
  FINANCE_WRITE: 'finance:write',
  FINANCE_APPROVE: 'finance:approve',
  FINANCE_RECONCILE: 'finance:reconcile',

  // Broker Permissions
  BROKER_READ: 'broker:read',
  BROKER_WRITE: 'broker:write',
  BROKER_COMMISSION: 'broker:commission',

  // Compliance Permissions
  COMPLIANCE_READ: 'compliance:read',
  COMPLIANCE_WRITE: 'compliance:write',
  COMPLIANCE_APPROVE: 'compliance:approve',

  // POPIA Permissions
  POPIA_READ: 'popia:read',
  POPIA_WRITE: 'popia:write',
  POPIA_DSR_PROCESS: 'popia:dsr_process',
  POPIA_BREACH_MANAGE: 'popia:breach_manage',

  // Audit Permissions
  AUDIT_READ: 'audit:read',

  // Report Permissions
  REPORT_READ: 'report:read',
  REPORT_GENERATE: 'report:generate',
  REPORT_EXPORT: 'report:export',

  // Marketing Permissions
  MARKETING_READ: 'marketing:read',
  MARKETING_WRITE: 'marketing:write',
  MARKETING_CAMPAIGN: 'marketing:campaign',

  // Fraud Permissions
  FRAUD_READ: 'fraud:read',
  FRAUD_INVESTIGATE: 'fraud:investigate',
  FRAUD_RESOLVE: 'fraud:resolve',

  // Operations Permissions
  OPERATIONS_READ: 'operations:read',
  OPERATIONS_WRITE: 'operations:write',
  OPERATIONS_DEBIT_ORDERS: 'operations:debit_orders',
  OPERATIONS_CALL_CENTRE: 'operations:call_centre',
  OPERATIONS_ARREARS: 'operations:arrears',
} as const

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
