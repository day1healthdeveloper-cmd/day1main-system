/**
 * POPIA Data Classification Constants
 * Defines which fields contain special personal information (health data)
 */

export enum DataClassification {
  PUBLIC = 'public',
  PERSONAL = 'personal',
  SPECIAL_PERSONAL = 'special_personal', // Health data, biometric, etc.
  CONFIDENTIAL = 'confidential',
}

export enum ProcessingPurpose {
  MEMBER_ONBOARDING = 'member_onboarding',
  CLAIMS_PROCESSING = 'claims_processing',
  UNDERWRITING = 'underwriting',
  FRAUD_DETECTION = 'fraud_detection',
  COMPLIANCE = 'compliance',
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
}

/**
 * Fields that contain special personal information (health data)
 * According to POPIA Section 26
 */
export const SPECIAL_PERSONAL_INFO_FIELDS = {
  // Member health-related fields
  member: [
    'medical_history',
    'chronic_conditions',
    'medications',
    'allergies',
    'disabilities',
    'genetic_information',
    'biometric_data',
  ],

  // Claim health-related fields
  claim: [
    'diagnosis_code',
    'diagnosis_description',
    'procedure_code',
    'procedure_description',
    'clinical_notes',
    'treatment_details',
    'prescription_details',
    'lab_results',
    'medical_reports',
  ],

  // Pre-auth health-related fields
  preauth: [
    'diagnosis_code',
    'diagnosis_description',
    'procedure_code',
    'procedure_description',
    'clinical_motivation',
    'medical_necessity',
  ],

  // Provider health-related fields
  provider: ['specialization', 'practice_number', 'hpcsa_number'],
}

/**
 * Permissions required to access special personal information
 */
export const SPECIAL_INFO_PERMISSIONS = {
  READ_HEALTH_DATA: 'health_data:read',
  WRITE_HEALTH_DATA: 'health_data:write',
  PROCESS_CLAIMS: 'claim:process',
  VIEW_MEDICAL_HISTORY: 'member:view_medical_history',
}

/**
 * Retention periods for different data types (in days)
 * According to POPIA and industry regulations
 */
export const DATA_RETENTION_PERIODS = {
  MEMBER_DATA: 365 * 7, // 7 years
  CLAIM_DATA: 365 * 5, // 5 years
  AUDIT_LOGS: 365 * 7, // 7 years
  CONSENT_RECORDS: 365 * 7, // 7 years
  MARKETING_DATA: 365 * 3, // 3 years
}
