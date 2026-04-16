import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    const {
      memberNumber,
      memberId,
      benefitType,
      claimedAmount
    } = body;

    // Validate required fields
    if ((!memberNumber && !memberId) || !benefitType) {
      return NextResponse.json(
        { error: 'Member identifier and benefit type are required' },
        { status: 400 }
      );
    }

    // Find member
    let memberQuery = supabase
      .from('members')
      .select('id, member_number, plan_id, plan_name, start_date, status');

    if (memberId) {
      memberQuery = memberQuery.eq('id', memberId);
    } else {
      memberQuery = memberQuery.eq('member_number', memberNumber);
    }

    const { data: member, error: memberError } = await memberQuery.single();

    if (memberError || !member) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Member not found',
          reason: 'MEMBER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Check member status
    if (member.status !== 'active') {
      return NextResponse.json({
        valid: false,
        error: 'Member is not active',
        reason: 'MEMBER_INACTIVE',
        memberStatus: member.status
      });
    }

    // Check if member has a plan
    if (!member.plan_id) {
      return NextResponse.json({
        valid: false,
        error: 'Member does not have an active plan',
        reason: 'NO_PLAN'
      });
    }

    // Get plan benefits
    const { data: benefits, error: benefitsError } = await supabase
      .from('product_benefits')
      .select('*')
      .eq('product_id', member.plan_id)
      .eq('type', benefitType);

    if (benefitsError) {
      console.error('Error fetching benefits:', benefitsError);
      throw benefitsError;
    }

    // Check if benefit exists in plan
    if (!benefits || benefits.length === 0) {
      return NextResponse.json({
        valid: false,
        error: `Benefit type '${benefitType}' is not covered under plan '${member.plan_name}'`,
        reason: 'BENEFIT_NOT_COVERED',
        planName: member.plan_name
      });
    }

    const benefit = benefits[0];

    // Calculate waiting period
    const memberStartDate = new Date(member.start_date);
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - memberStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const waitingPeriodDays = benefit.waiting_period_days || 0;
    const waitingPeriodRemaining = Math.max(0, waitingPeriodDays - daysSinceStart);
    const waitingPeriodPassed = daysSinceStart >= waitingPeriodDays;
    
    // Calculate waiting period end date
    const waitingPeriodEndDate = new Date(memberStartDate);
    waitingPeriodEndDate.setDate(waitingPeriodEndDate.getDate() + waitingPeriodDays);
    
    // Check for pre-existing condition exclusion period
    const preExistingExclusionDays = benefit.pre_existing_exclusion_days || 0;
    const preExistingExclusionRemaining = Math.max(0, preExistingExclusionDays - daysSinceStart);
    const preExistingExclusionPassed = daysSinceStart >= preExistingExclusionDays;
    
    // Calculate pre-existing exclusion end date
    const preExistingExclusionEndDate = new Date(memberStartDate);
    preExistingExclusionEndDate.setDate(preExistingExclusionEndDate.getDate() + preExistingExclusionDays);

    // Get benefit usage for current year
    const currentYear = new Date().getFullYear();
    const { data: usage, error: usageError } = await supabase
      .from('benefit_usage')
      .select('*')
      .eq('member_id', member.id)
      .eq('benefit_type', benefitType)
      .eq('year', currentYear)
      .single();

    // Calculate usage and limits
    let usedAmount = 0;
    let usedCount = 0;
    let remainingAmount = benefit.annual_limit || 0;
    let remainingCount = benefit.annual_limit || 0;
    let hasUsage = false;

    if (usage && !usageError) {
      hasUsage = true;
      usedAmount = parseFloat(usage.used_amount || 0);
      usedCount = usage.used_count || 0;
      remainingAmount = parseFloat(usage.remaining_amount || 0);
      remainingCount = usage.remaining_count || 0;
    } else {
      // No usage record yet, use benefit limits
      remainingAmount = benefit.annual_limit || 0;
      remainingCount = benefit.annual_limit || 0;
    }

    // Check if annual limit exceeded
    const annualLimitExceeded = benefit.annual_limit && remainingAmount <= 0;

    // Check if claimed amount exceeds remaining limit
    const claimExceedsLimit = claimedAmount && benefit.annual_limit && 
      (parseFloat(claimedAmount) > remainingAmount);

    // Determine overall validity
    const valid = 
      member.status === 'active' &&
      waitingPeriodPassed &&
      preExistingExclusionPassed &&
      !annualLimitExceeded &&
      !claimExceedsLimit;

    // Build warnings array
    const warnings = [];
    
    // Waiting period warnings
    if (!waitingPeriodPassed) {
      const severity = waitingPeriodRemaining > 30 ? 'error' : 'warning';
      warnings.push({
        type: 'WAITING_PERIOD',
        message: `General waiting period: ${waitingPeriodRemaining} days remaining (ends ${waitingPeriodEndDate.toLocaleDateString()})`,
        severity,
        daysRemaining: waitingPeriodRemaining,
        endDate: waitingPeriodEndDate.toISOString()
      });
    }
    
    // Pre-existing condition exclusion warnings
    if (!preExistingExclusionPassed && preExistingExclusionDays > 0) {
      warnings.push({
        type: 'PRE_EXISTING_EXCLUSION',
        message: `Pre-existing condition exclusion: ${preExistingExclusionRemaining} days remaining (ends ${preExistingExclusionEndDate.toLocaleDateString()})`,
        severity: 'error',
        daysRemaining: preExistingExclusionRemaining,
        endDate: preExistingExclusionEndDate.toISOString()
      });
    }
    
    // Limit warnings
    if (claimExceedsLimit) {
      warnings.push({
        type: 'EXCEEDS_LIMIT',
        message: `Claimed amount R${parseFloat(claimedAmount).toLocaleString()} exceeds remaining limit R${remainingAmount.toLocaleString()}`,
        severity: 'error'
      });
    }
    
    if (annualLimitExceeded) {
      warnings.push({
        type: 'LIMIT_EXHAUSTED',
        message: 'Annual benefit limit has been exhausted',
        severity: 'error'
      });
    }
    
    // Approaching limit warning (80% used)
    if (benefit.annual_limit && !annualLimitExceeded && remainingAmount > 0) {
      const percentageUsed = (usedAmount / benefit.annual_limit) * 100;
      if (percentageUsed >= 80) {
        warnings.push({
          type: 'APPROACHING_LIMIT',
          message: `You have used ${Math.round(percentageUsed)}% of your annual limit. Only R${remainingAmount.toLocaleString()} remaining.`,
          severity: 'warning'
        });
      }
    }

    // Return validation result
    return NextResponse.json({
      valid,
      member: {
        id: member.id,
        memberNumber: member.member_number,
        planName: member.plan_name,
        status: member.status,
        startDate: member.start_date,
        daysSinceStart
      },
      benefit: {
        type: benefitType,
        name: benefit.name,
        description: benefit.description,
        coverAmount: benefit.cover_amount,
        annualLimit: benefit.annual_limit,
        waitingPeriodDays: benefit.waiting_period_days,
        waitingPeriodPassed,
        waitingPeriodRemaining,
        waitingPeriodEndDate: waitingPeriodEndDate.toISOString(),
        preExistingExclusionDays: benefit.pre_existing_exclusion_days,
        preExistingExclusionPassed,
        preExistingExclusionRemaining,
        preExistingExclusionEndDate: preExistingExclusionEndDate.toISOString()
      },
      usage: {
        hasUsage,
        year: currentYear,
        usedAmount,
        usedCount,
        remainingAmount,
        remainingCount,
        percentageUsed: benefit.annual_limit ? 
          Math.round((usedAmount / benefit.annual_limit) * 100) : 0
      },
      validation: {
        canSubmitClaim: valid,
        waitingPeriodPassed,
        preExistingExclusionPassed,
        annualLimitExceeded,
        claimExceedsLimit
      },
      warnings
    });

  } catch (error) {
    console.error('Error validating benefit:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: 'Failed to validate benefit', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
