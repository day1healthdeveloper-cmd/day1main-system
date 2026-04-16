/**
 * Server-side benefit validation utilities
 * Used by API routes to validate claims against benefit limits
 */

interface BenefitUsage {
  id: string;
  member_id: string;
  benefit_type: string;
  year: number;
  total_limit_amount: number | null;
  total_limit_count: number | null;
  used_amount: number;
  used_count: number;
  remaining_amount: number | null;
  remaining_count: number | null;
}

interface BenefitLimit {
  annual_limit: number | null;
  cover_amount: number | null;
  waiting_period_days: number;
}

interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  usage?: BenefitUsage;
  limit?: BenefitLimit;
}

/**
 * Check if a claim amount is within benefit limits
 */
export async function validateBenefitLimit(
  supabase: any,
  memberId: string,
  benefitType: string,
  claimedAmount: number,
  planId?: string
): Promise<ValidationResult> {
  const warnings: string[] = [];
  const errors: string[] = [];
  const currentYear = new Date().getFullYear();

  try {
    // Get benefit usage for current year
    const { data: usage } = await supabase
      .from('benefit_usage')
      .select('*')
      .eq('member_id', memberId)
      .eq('benefit_type', benefitType)
      .eq('year', currentYear)
      .single();

    // Get benefit limits from product_benefits if we have a plan
    let limit: BenefitLimit | null = null;
    if (planId) {
      const { data: benefitData } = await supabase
        .from('product_benefits')
        .select('annual_limit, cover_amount, waiting_period_days')
        .eq('product_id', planId)
        .eq('type', benefitType)
        .single();
      
      limit = benefitData;
    }

    // If no usage record exists, check if we have limits to initialize
    if (!usage) {
      if (limit && limit.annual_limit) {
        // Check if claimed amount exceeds annual limit
        if (claimedAmount > limit.annual_limit) {
          errors.push(`Claimed amount R${claimedAmount} exceeds annual limit of R${limit.annual_limit}`);
          return { valid: false, warnings, errors, limit };
        }
      }
      
      // No usage yet, claim is valid
      return { valid: true, warnings, errors, limit };
    }

    // Check if adding this claim would exceed limits
    const newUsedAmount = (usage.used_amount || 0) + claimedAmount;

    // Check amount limit
    if (usage.total_limit_amount && newUsedAmount > usage.total_limit_amount) {
      const remaining = usage.total_limit_amount - (usage.used_amount || 0);
      errors.push(
        `Claim would exceed annual limit. Remaining: R${remaining.toFixed(2)} of R${usage.total_limit_amount}`
      );
    }

    // Check count limit
    if (usage.total_limit_count && (usage.used_count || 0) >= usage.total_limit_count) {
      errors.push(
        `Annual visit limit reached. Used ${usage.used_count} of ${usage.total_limit_count} visits.`
      );
    }

    // Add warnings for high usage
    if (usage.total_limit_amount) {
      const usagePercentage = ((usage.used_amount || 0) / usage.total_limit_amount) * 100;
      if (usagePercentage >= 80 && usagePercentage < 100) {
        warnings.push(
          `Member has used ${usagePercentage.toFixed(0)}% of annual limit (R${usage.used_amount} of R${usage.total_limit_amount})`
        );
      }
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
      usage,
      limit: limit || undefined
    };
  } catch (error) {
    console.error('Error validating benefit limit:', error);
    // Don't block claim submission if validation fails
    warnings.push('Could not verify benefit limits. Claim will require manual review.');
    return { valid: true, warnings, errors };
  }
}

/**
 * Check waiting periods for a member
 */
export async function validateWaitingPeriod(
  supabase: any,
  memberId: string,
  benefitType: string,
  planId?: string
): Promise<ValidationResult> {
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    // Get member start date
    const { data: member } = await supabase
      .from('members')
      .select('start_date')
      .eq('id', memberId)
      .single();

    if (!member || !member.start_date) {
      warnings.push('Member start date not found. Waiting period cannot be verified.');
      return { valid: true, warnings, errors };
    }

    // Get waiting period from product_benefits
    let waitingPeriodDays = 90; // Default 3 months
    if (planId) {
      const { data: benefitData } = await supabase
        .from('product_benefits')
        .select('waiting_period_days')
        .eq('product_id', planId)
        .eq('type', benefitType)
        .single();
      
      if (benefitData && benefitData.waiting_period_days !== null) {
        waitingPeriodDays = benefitData.waiting_period_days;
      }
    }

    // Calculate days since start
    const startDate = new Date(member.start_date);
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceStart < waitingPeriodDays) {
      const daysRemaining = waitingPeriodDays - daysSinceStart;
      errors.push(
        `Waiting period not met. ${daysRemaining} days remaining (${waitingPeriodDays} days required).`
      );
      return { valid: false, warnings, errors };
    }

    return { valid: true, warnings, errors };
  } catch (error) {
    console.error('Error validating waiting period:', error);
    warnings.push('Could not verify waiting period. Claim will require manual review.');
    return { valid: true, warnings, errors };
  }
}

/**
 * Initialize benefit usage for a member when they join
 */
export async function initializeBenefitUsage(
  supabase: any,
  memberId: string,
  planId: string,
  year?: number
): Promise<void> {
  const currentYear = year || new Date().getFullYear();

  try {
    // Get all benefits for the plan
    const { data: benefits } = await supabase
      .from('product_benefits')
      .select('type, annual_limit, cover_amount')
      .eq('product_id', planId);

    if (!benefits || benefits.length === 0) {
      console.log('No benefits found for plan:', planId);
      return;
    }

    // Create usage records for each benefit
    const usageRecords = benefits.map((benefit: any) => ({
      member_id: memberId,
      benefit_type: benefit.type,
      year: currentYear,
      total_limit_amount: benefit.annual_limit || benefit.cover_amount,
      total_limit_count: null, // Will be set based on benefit type
      used_amount: 0,
      used_count: 0,
    }));

    // Insert all records (ignore conflicts if they already exist)
    await supabase
      .from('benefit_usage')
      .upsert(usageRecords, { 
        onConflict: 'member_id,benefit_type,year',
        ignoreDuplicates: true 
      });

    console.log(`Initialized benefit usage for member ${memberId}, ${benefits.length} benefits`);
  } catch (error) {
    console.error('Error initializing benefit usage:', error);
    throw error;
  }
}
