/**
 * Benefit Calculation Engine
 * Calculates approved amounts based on plan benefits, tariff rates, and co-payments
 */

export interface BenefitCalculationInput {
  claimedAmount: number;
  benefitType: string;
  memberPlanId: string;
  serviceDate: string;
  icd10Codes?: string[];
  tariffCodes?: string[];
  isPMB?: boolean;
  providerTier?: 'preferred' | 'network' | 'out_of_network';
}

export interface BenefitCalculationResult {
  claimedAmount: number;
  approvedAmount: number;
  memberResponsibility: number;
  schemePayment: number;
  copaymentAmount: number;
  copaymentPercentage: number;
  tariffRate: number;
  adjustmentReason?: string;
  calculation: {
    step: string;
    amount: number;
    description: string;
  }[];
}

/**
 * Calculate approved amount for a claim
 * This is a simplified version - in production, this would query:
 * - product_benefits table for benefit limits
 * - tariff_codes table for approved rates
 * - provider tier for rate adjustments
 * - PMB status for mandatory coverage
 */
export async function calculateBenefitAmount(
  input: BenefitCalculationInput
): Promise<BenefitCalculationResult> {
  const calculation: { step: string; amount: number; description: string }[] = [];
  
  // Step 1: Start with claimed amount
  let approvedAmount = input.claimedAmount;
  calculation.push({
    step: '1. Claimed Amount',
    amount: input.claimedAmount,
    description: 'Amount submitted by provider/member'
  });

  // Step 2: Apply tariff rate (if applicable)
  // In production, this would query tariff_codes table
  const tariffRate = getTariffRate(input.benefitType, input.providerTier);
  if (tariffRate < 100) {
    approvedAmount = input.claimedAmount * (tariffRate / 100);
    calculation.push({
      step: '2. Tariff Rate Applied',
      amount: approvedAmount,
      description: `${tariffRate}% of claimed amount (provider tier: ${input.providerTier || 'network'})`
    });
  }

  // Step 3: Apply PMB rules (Prescribed Minimum Benefits)
  if (input.isPMB) {
    // PMBs must be covered at 100% at network providers
    if (input.providerTier === 'network' || input.providerTier === 'preferred') {
      approvedAmount = input.claimedAmount;
      calculation.push({
        step: '3. PMB Coverage',
        amount: approvedAmount,
        description: 'PMB claim - 100% coverage at network provider'
      });
    }
  }

  // Step 4: Apply co-payment (if applicable)
  const copaymentPercentage = getCopaymentPercentage(input.benefitType, input.providerTier);
  const copaymentAmount = approvedAmount * (copaymentPercentage / 100);
  
  if (copaymentAmount > 0) {
    calculation.push({
      step: '4. Co-payment',
      amount: copaymentAmount,
      description: `${copaymentPercentage}% member co-payment`
    });
  }

  // Step 5: Calculate final amounts
  const schemePayment = approvedAmount - copaymentAmount;
  const memberResponsibility = input.claimedAmount - schemePayment;

  calculation.push({
    step: '5. Scheme Payment',
    amount: schemePayment,
    description: 'Amount to be paid by medical scheme'
  });

  calculation.push({
    step: '6. Member Responsibility',
    amount: memberResponsibility,
    description: 'Amount member must pay (includes co-payment and any shortfall)'
  });

  // Determine adjustment reason if approved amount differs from claimed
  let adjustmentReason: string | undefined;
  if (approvedAmount < input.claimedAmount) {
    if (tariffRate < 100) {
      adjustmentReason = `Adjusted to ${tariffRate}% tariff rate`;
    } else if (copaymentAmount > 0) {
      adjustmentReason = `${copaymentPercentage}% co-payment applies`;
    } else {
      adjustmentReason = 'Adjusted to approved rate';
    }
  }

  return {
    claimedAmount: input.claimedAmount,
    approvedAmount,
    memberResponsibility,
    schemePayment,
    copaymentAmount,
    copaymentPercentage,
    tariffRate,
    adjustmentReason,
    calculation
  };
}

/**
 * Get tariff rate based on benefit type and provider tier
 * In production, this would query the tariff_codes table
 */
function getTariffRate(benefitType: string, providerTier?: string): number {
  // Default rates by provider tier
  const tierRates: Record<string, number> = {
    preferred: 100,    // 100% of tariff
    network: 100,      // 100% of tariff
    out_of_network: 80 // 80% of tariff
  };

  // Benefit-specific adjustments
  const benefitRates: Record<string, number> = {
    doctor_visits: 100,
    specialist: 100,
    dentistry: 80,
    optometry: 100,
    pathology: 100,
    radiology: 100,
    medication: 100,
    chronic_medication: 100,
    hospital: 100,
    maternity: 100
  };

  const baseRate = benefitRates[benefitType] || 100;
  const tierMultiplier = tierRates[providerTier || 'network'] / 100;

  return baseRate * tierMultiplier;
}

/**
 * Get co-payment percentage based on benefit type and provider tier
 * In production, this would query product_benefits table
 */
function getCopaymentPercentage(benefitType: string, providerTier?: string): number {
  // Out-of-network providers typically have higher co-payments
  if (providerTier === 'out_of_network') {
    return 20; // 20% co-payment for out-of-network
  }

  // Benefit-specific co-payments
  const copayments: Record<string, number> = {
    doctor_visits: 0,
    specialist: 0,
    dentistry: 10,      // 10% co-payment for dental
    optometry: 0,
    pathology: 0,
    radiology: 0,
    medication: 0,
    chronic_medication: 0,
    hospital: 10,       // 10% co-payment for hospital
    maternity: 0
  };

  return copayments[benefitType] || 0;
}

/**
 * Validate if claim amount is reasonable
 * Flags claims that are significantly above expected amounts
 */
export function validateClaimAmount(
  claimedAmount: number,
  benefitType: string
): { valid: boolean; warning?: string } {
  // Expected ranges by benefit type (in ZAR)
  const expectedRanges: Record<string, { min: number; max: number; typical: number }> = {
    doctor_visits: { min: 200, max: 2000, typical: 600 },
    specialist: { min: 500, max: 5000, typical: 1500 },
    dentistry: { min: 300, max: 10000, typical: 1200 },
    optometry: { min: 500, max: 5000, typical: 2000 },
    pathology: { min: 200, max: 5000, typical: 800 },
    radiology: { min: 500, max: 15000, typical: 2500 },
    medication: { min: 50, max: 2000, typical: 400 },
    chronic_medication: { min: 200, max: 5000, typical: 1500 },
    hospital: { min: 5000, max: 500000, typical: 50000 },
    maternity: { min: 10000, max: 200000, typical: 40000 }
  };

  const range = expectedRanges[benefitType];
  if (!range) {
    return { valid: true };
  }

  // Check if amount is suspiciously low
  if (claimedAmount < range.min) {
    return {
      valid: true,
      warning: `Amount (R${claimedAmount}) is below typical range for ${benefitType} (R${range.min} - R${range.max})`
    };
  }

  // Check if amount is suspiciously high
  if (claimedAmount > range.max) {
    return {
      valid: false,
      warning: `Amount (R${claimedAmount}) exceeds maximum expected for ${benefitType} (R${range.max}). Requires review.`
    };
  }

  // Check if amount is significantly above typical
  if (claimedAmount > range.typical * 2) {
    return {
      valid: true,
      warning: `Amount (R${claimedAmount}) is significantly above typical for ${benefitType} (R${range.typical}). May require review.`
    };
  }

  return { valid: true };
}

/**
 * Calculate fraud risk score based on claim characteristics
 * Returns score from 0-100 (higher = more suspicious)
 */
export function calculateFraudRiskScore(input: {
  claimedAmount: number;
  benefitType: string;
  serviceDate: string;
  submissionDate: string;
  providerClaimCount?: number;
  memberClaimCount?: number;
  hasDocumentation: boolean;
}): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  // Factor 1: Amount validation
  const amountValidation = validateClaimAmount(input.claimedAmount, input.benefitType);
  if (!amountValidation.valid) {
    score += 30;
    factors.push('Claim amount exceeds expected range');
  } else if (amountValidation.warning && amountValidation.warning.includes('significantly above')) {
    score += 15;
    factors.push('Claim amount significantly above typical');
  }

  // Factor 2: Submission timing
  const serviceDate = new Date(input.serviceDate);
  const submissionDate = new Date(input.submissionDate);
  const daysBetween = Math.floor((submissionDate.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysBetween > 90) {
    score += 20;
    factors.push('Claim submitted more than 90 days after service');
  } else if (daysBetween < 0) {
    score += 40;
    factors.push('Service date is in the future');
  }

  // Factor 3: Documentation
  if (!input.hasDocumentation) {
    score += 25;
    factors.push('No supporting documentation provided');
  }

  // Factor 4: Provider claim frequency
  if (input.providerClaimCount && input.providerClaimCount > 100) {
    score += 10;
    factors.push('High volume provider (>100 claims)');
  }

  // Factor 5: Member claim frequency
  if (input.memberClaimCount && input.memberClaimCount > 20) {
    score += 15;
    factors.push('High frequency claimant (>20 claims)');
  }

  // Cap score at 100
  score = Math.min(score, 100);

  return { score, factors };
}

/**
 * Determine if claim requires manual review
 */
export function requiresManualReview(input: {
  claimedAmount: number;
  benefitType: string;
  fraudRiskScore: number;
  isPMB: boolean;
  hasPreAuth: boolean;
  preAuthRequired: boolean;
}): { required: boolean; reason: string } {
  // High-value claims always require review
  if (input.claimedAmount > 50000) {
    return {
      required: true,
      reason: 'High-value claim (>R50,000)'
    };
  }

  // High fraud risk requires review
  if (input.fraudRiskScore > 50) {
    return {
      required: true,
      reason: `High fraud risk score (${input.fraudRiskScore})`
    };
  }

  // PMB claims require review
  if (input.isPMB) {
    return {
      required: true,
      reason: 'Prescribed Minimum Benefit (PMB) claim'
    };
  }

  // Missing pre-auth when required
  if (input.preAuthRequired && !input.hasPreAuth) {
    return {
      required: true,
      reason: 'Pre-authorization required but not provided'
    };
  }

  return { required: false, reason: '' };
}
