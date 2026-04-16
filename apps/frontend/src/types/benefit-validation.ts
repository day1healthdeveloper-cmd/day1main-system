/**
 * Benefit Validation Types
 * Used for validating claims against member benefits
 */

export interface BenefitValidationRequest {
  memberNumber?: string;
  memberId?: string;
  benefitType: string;
  claimedAmount?: number;
}

export interface BenefitValidationWarning {
  type: 'WAITING_PERIOD' | 'PRE_EXISTING_EXCLUSION' | 'EXCEEDS_LIMIT' | 'LIMIT_EXHAUSTED' | 'APPROACHING_LIMIT';
  message: string;
  severity: 'warning' | 'error';
  daysRemaining?: number;
  endDate?: string;
}

export interface BenefitValidationResponse {
  valid: boolean;
  error?: string;
  reason?: string;
  member?: {
    id: string;
    memberNumber: string;
    planName: string;
    status: string;
    startDate: string;
    daysSinceStart: number;
  };
  benefit?: {
    type: string;
    name: string;
    description: string;
    coverAmount: number;
    annualLimit: number;
    waitingPeriodDays: number;
    waitingPeriodPassed: boolean;
    waitingPeriodRemaining: number;
    waitingPeriodEndDate: string;
    preExistingExclusionDays: number;
    preExistingExclusionPassed: boolean;
    preExistingExclusionRemaining: number;
    preExistingExclusionEndDate: string;
  };
  usage?: {
    hasUsage: boolean;
    year: number;
    usedAmount: number;
    usedCount: number;
    remainingAmount: number;
    remainingCount: number;
    percentageUsed: number;
  };
  validation?: {
    canSubmitClaim: boolean;
    waitingPeriodPassed: boolean;
    preExistingExclusionPassed: boolean;
    annualLimitExceeded: boolean;
    claimExceedsLimit: boolean;
  };
  warnings?: BenefitValidationWarning[];
}
