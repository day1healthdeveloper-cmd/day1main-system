/**
 * Standard Rejection Codes for Claims Adjudication
 * Based on South African Medical Schemes industry standards
 */

export interface RejectionCode {
  code: string;
  description: string;
  category: 'coverage' | 'documentation' | 'authorization' | 'eligibility' | 'duplicate' | 'fraud' | 'other';
  requiresAppeal: boolean;
}

export const REJECTION_CODES: Record<string, RejectionCode> = {
  // Coverage Issues (R01-R10)
  R01: {
    code: 'R01',
    description: 'Service not covered under plan',
    category: 'coverage',
    requiresAppeal: true
  },
  R02: {
    code: 'R02',
    description: 'Benefit limit exceeded',
    category: 'coverage',
    requiresAppeal: true
  },
  R03: {
    code: 'R03',
    description: 'Waiting period not met',
    category: 'coverage',
    requiresAppeal: false
  },
  R04: {
    code: 'R04',
    description: 'Pre-existing condition exclusion applies',
    category: 'coverage',
    requiresAppeal: true
  },
  R05: {
    code: 'R05',
    description: 'Service excluded from coverage',
    category: 'coverage',
    requiresAppeal: true
  },
  R06: {
    code: 'R06',
    description: 'Cosmetic procedure not covered',
    category: 'coverage',
    requiresAppeal: true
  },
  R07: {
    code: 'R07',
    description: 'Experimental treatment not covered',
    category: 'coverage',
    requiresAppeal: true
  },
  R08: {
    code: 'R08',
    description: 'Over-the-counter medication not covered',
    category: 'coverage',
    requiresAppeal: false
  },
  R09: {
    code: 'R09',
    description: 'Service not medically necessary',
    category: 'coverage',
    requiresAppeal: true
  },
  R10: {
    code: 'R10',
    description: 'Alternative treatment available',
    category: 'coverage',
    requiresAppeal: true
  },

  // Documentation Issues (R11-R20)
  R11: {
    code: 'R11',
    description: 'Missing invoice or receipt',
    category: 'documentation',
    requiresAppeal: false
  },
  R12: {
    code: 'R12',
    description: 'Missing prescription',
    category: 'documentation',
    requiresAppeal: false
  },
  R13: {
    code: 'R13',
    description: 'Missing clinical notes',
    category: 'documentation',
    requiresAppeal: false
  },
  R14: {
    code: 'R14',
    description: 'Invalid or missing ICD-10 code',
    category: 'documentation',
    requiresAppeal: false
  },
  R15: {
    code: 'R15',
    description: 'Invalid or missing procedure code',
    category: 'documentation',
    requiresAppeal: false
  },
  R16: {
    code: 'R16',
    description: 'Incomplete claim information',
    category: 'documentation',
    requiresAppeal: false
  },
  R17: {
    code: 'R17',
    description: 'Illegible documentation',
    category: 'documentation',
    requiresAppeal: false
  },
  R18: {
    code: 'R18',
    description: 'Missing discharge summary',
    category: 'documentation',
    requiresAppeal: false
  },
  R19: {
    code: 'R19',
    description: 'Missing referral letter',
    category: 'documentation',
    requiresAppeal: false
  },
  R20: {
    code: 'R20',
    description: 'Documentation does not support claim',
    category: 'documentation',
    requiresAppeal: true
  },

  // Authorization Issues (R21-R30)
  R21: {
    code: 'R21',
    description: 'Pre-authorization required but not obtained',
    category: 'authorization',
    requiresAppeal: false
  },
  R22: {
    code: 'R22',
    description: 'Pre-authorization expired',
    category: 'authorization',
    requiresAppeal: false
  },
  R23: {
    code: 'R23',
    description: 'Pre-authorization denied',
    category: 'authorization',
    requiresAppeal: true
  },
  R24: {
    code: 'R24',
    description: 'Service exceeds authorized amount',
    category: 'authorization',
    requiresAppeal: true
  },
  R25: {
    code: 'R25',
    description: 'Service not covered by authorization',
    category: 'authorization',
    requiresAppeal: true
  },
  R26: {
    code: 'R26',
    description: 'Authorization number invalid',
    category: 'authorization',
    requiresAppeal: false
  },

  // Eligibility Issues (R31-R40)
  R31: {
    code: 'R31',
    description: 'Member not active on service date',
    category: 'eligibility',
    requiresAppeal: false
  },
  R32: {
    code: 'R32',
    description: 'Member not found',
    category: 'eligibility',
    requiresAppeal: false
  },
  R33: {
    code: 'R33',
    description: 'Dependant not registered',
    category: 'eligibility',
    requiresAppeal: false
  },
  R34: {
    code: 'R34',
    description: 'Member suspended for non-payment',
    category: 'eligibility',
    requiresAppeal: false
  },
  R35: {
    code: 'R35',
    description: 'Coverage terminated',
    category: 'eligibility',
    requiresAppeal: false
  },
  R36: {
    code: 'R36',
    description: 'Service date outside coverage period',
    category: 'eligibility',
    requiresAppeal: false
  },

  // Duplicate Claims (R41-R45)
  R41: {
    code: 'R41',
    description: 'Duplicate claim',
    category: 'duplicate',
    requiresAppeal: false
  },
  R42: {
    code: 'R42',
    description: 'Claim already paid',
    category: 'duplicate',
    requiresAppeal: false
  },
  R43: {
    code: 'R43',
    description: 'Claim already processed',
    category: 'duplicate',
    requiresAppeal: false
  },

  // Fraud/Abuse (R46-R50)
  R46: {
    code: 'R46',
    description: 'Suspected fraud - under investigation',
    category: 'fraud',
    requiresAppeal: true
  },
  R47: {
    code: 'R47',
    description: 'Provider not contracted',
    category: 'fraud',
    requiresAppeal: false
  },
  R48: {
    code: 'R48',
    description: 'Unbundling detected',
    category: 'fraud',
    requiresAppeal: true
  },
  R49: {
    code: 'R49',
    description: 'Upcoding detected',
    category: 'fraud',
    requiresAppeal: true
  },
  R50: {
    code: 'R50',
    description: 'Pattern of abuse detected',
    category: 'fraud',
    requiresAppeal: true
  },

  // Other (R51-R60)
  R51: {
    code: 'R51',
    description: 'Claim submitted after time limit',
    category: 'other',
    requiresAppeal: false
  },
  R52: {
    code: 'R52',
    description: 'Incorrect provider information',
    category: 'other',
    requiresAppeal: false
  },
  R53: {
    code: 'R53',
    description: 'Incorrect member information',
    category: 'other',
    requiresAppeal: false
  },
  R54: {
    code: 'R54',
    description: 'Pricing error',
    category: 'other',
    requiresAppeal: false
  },
  R55: {
    code: 'R55',
    description: 'System error - resubmit',
    category: 'other',
    requiresAppeal: false
  },
  R56: {
    code: 'R56',
    description: 'Requires manual review',
    category: 'other',
    requiresAppeal: false
  },
  R57: {
    code: 'R57',
    description: 'Third party liability',
    category: 'other',
    requiresAppeal: true
  },
  R58: {
    code: 'R58',
    description: 'Coordination of benefits required',
    category: 'other',
    requiresAppeal: false
  },
  R59: {
    code: 'R59',
    description: 'Service date too old',
    category: 'other',
    requiresAppeal: false
  },
  R60: {
    code: 'R60',
    description: 'Other - see notes',
    category: 'other',
    requiresAppeal: true
  }
};

// Helper function to get rejection code
export function getRejectionCode(code: string): RejectionCode | null {
  return REJECTION_CODES[code] || null;
}

// Helper function to get rejection codes by category
export function getRejectionCodesByCategory(category: string): RejectionCode[] {
  return Object.values(REJECTION_CODES).filter(rc => rc.category === category);
}

// Helper function to get all rejection codes
export function getAllRejectionCodes(): RejectionCode[] {
  return Object.values(REJECTION_CODES);
}

// Helper function to check if code requires appeal
export function requiresAppeal(code: string): boolean {
  const rejectionCode = getRejectionCode(code);
  return rejectionCode?.requiresAppeal || false;
}

// Pend reasons (for requesting additional information)
export const PEND_REASONS = [
  'Missing supporting documentation',
  'Incomplete claim information',
  'Requires clinical review',
  'Awaiting pre-authorization',
  'Requires member verification',
  'Requires provider clarification',
  'Pricing verification needed',
  'Diagnosis code clarification needed',
  'Procedure code clarification needed',
  'Duplicate claim investigation',
  'Fraud investigation in progress',
  'Other - see notes'
];

// Get pend reason options for dropdown
export function getPendReasons(): string[] {
  return PEND_REASONS;
}
