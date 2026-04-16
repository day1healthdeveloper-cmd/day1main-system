import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/provider/eligibility
 * 
 * Real-time member eligibility and benefit verification
 * 
 * Body:
 * - memberNumber (optional): Member number
 * - idNumber (optional): ID number
 * 
 * At least one identifier is required
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { memberNumber, idNumber } = body;

    // Validate input
    if (!memberNumber && !idNumber) {
      return NextResponse.json(
        { error: 'Either memberNumber or idNumber is required' },
        { status: 400 }
      );
    }

    // Search for member
    let query = supabase
      .from('members')
      .select(`
        id,
        member_number,
        first_name,
        last_name,
        id_number,
        date_of_birth,
        status,
        plan_name,
        plan_id,
        start_date,
        broker_code,
        monthly_premium,
        products (
          id,
          name,
          code,
          regime
        )
      `)
      .limit(1);

    if (memberNumber) {
      query = query.eq('member_number', memberNumber);
    } else if (idNumber) {
      query = query.eq('id_number', idNumber);
    }

    const { data: member, error: memberError } = await query.single();

    if (memberError || !member) {
      return NextResponse.json({
        eligible: false,
        message: 'Member not found',
        member: null,
        policy: null,
        waitingPeriods: null,
        benefits: null
      });
    }

    // Check member status
    const isActive = member.status === 'active';
    
    if (!isActive) {
      return NextResponse.json({
        eligible: false,
        message: `Member is not active. Current status: ${member.status}`,
        member: {
          memberNumber: member.member_number,
          firstName: member.first_name,
          lastName: member.last_name,
          idNumber: member.id_number,
          dateOfBirth: member.date_of_birth,
          status: member.status,
          planName: member.plan_name
        },
        policy: null,
        waitingPeriods: null,
        benefits: null
      });
    }

    // Calculate waiting periods
    const waitingPeriods = calculateWaitingPeriods(member.start_date);

    // Get benefit information
    const benefits = await getBenefitInformation(
      supabase,
      member.id,
      member.plan_id
    );

    // Build response
    return NextResponse.json({
      eligible: true,
      message: 'Member is eligible for claims',
      member: {
        memberNumber: member.member_number,
        firstName: member.first_name,
        lastName: member.last_name,
        idNumber: member.id_number,
        dateOfBirth: member.date_of_birth,
        status: member.status,
        planName: member.plan_name
      },
      policy: {
        policyNumber: member.member_number,
        planType: member.products?.regime || 'Unknown',
        planCode: member.products?.code || 'Unknown',
        status: member.status,
        startDate: member.start_date,
        brokerCode: member.broker_code,
        monthlyPremium: member.monthly_premium
      },
      waitingPeriods,
      benefits
    });

  } catch (error) {
    console.error('Error checking eligibility:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check eligibility',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate waiting periods based on member start date
 */
function calculateWaitingPeriods(startDate: string | null) {
  if (!startDate) {
    return {
      general: { completed: false, daysRemaining: 90, startDate: null },
      specialist: { completed: false, daysRemaining: 90, startDate: null },
      hospital: { completed: false, daysRemaining: 90, startDate: null },
      maternity: { completed: false, daysRemaining: 365, startDate: null }
    };
  }

  const start = new Date(startDate);
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const waitingPeriodDays = {
    general: 90,      // 3 months
    specialist: 90,   // 3 months
    hospital: 90,     // 3 months
    maternity: 365    // 12 months
  };

  return {
    general: {
      completed: daysSinceStart >= waitingPeriodDays.general,
      daysRemaining: Math.max(0, waitingPeriodDays.general - daysSinceStart),
      startDate: startDate,
      requiredDays: waitingPeriodDays.general
    },
    specialist: {
      completed: daysSinceStart >= waitingPeriodDays.specialist,
      daysRemaining: Math.max(0, waitingPeriodDays.specialist - daysSinceStart),
      startDate: startDate,
      requiredDays: waitingPeriodDays.specialist
    },
    hospital: {
      completed: daysSinceStart >= waitingPeriodDays.hospital,
      daysRemaining: Math.max(0, waitingPeriodDays.hospital - daysSinceStart),
      startDate: startDate,
      requiredDays: waitingPeriodDays.hospital
    },
    maternity: {
      completed: daysSinceStart >= waitingPeriodDays.maternity,
      daysRemaining: Math.max(0, waitingPeriodDays.maternity - daysSinceStart),
      startDate: startDate,
      requiredDays: waitingPeriodDays.maternity
    }
  };
}

/**
 * Get benefit information including limits and usage
 */
async function getBenefitInformation(
  supabase: any,
  memberId: string,
  planId: string | null
) {
  const currentYear = new Date().getFullYear();
  const benefits: any = {};

  if (!planId) {
    return benefits;
  }

  try {
    // Get product benefits
    const { data: productBenefits } = await supabase
      .from('product_benefits')
      .select('*')
      .eq('product_id', planId);

    if (!productBenefits || productBenefits.length === 0) {
      return benefits;
    }

    // Get benefit usage for current year
    const { data: usageRecords } = await supabase
      .from('benefit_usage')
      .select('*')
      .eq('member_id', memberId)
      .eq('year', currentYear);

    // Create usage map for quick lookup
    const usageMap = new Map();
    if (usageRecords) {
      usageRecords.forEach((usage: any) => {
        usageMap.set(usage.benefit_type, usage);
      });
    }

    // Build benefit information
    for (const benefit of productBenefits) {
      const usage = usageMap.get(benefit.type);
      const limit = benefit.annual_limit || benefit.cover_amount || 0;
      const used = usage ? (usage.used_amount || 0) : 0;
      const usedCount = usage ? (usage.used_count || 0) : 0;
      const remaining = limit > 0 ? Math.max(0, limit - used) : 0;

      // Determine limit display
      let limitDisplay = 'Unlimited';
      if (limit > 0) {
        limitDisplay = `R${limit.toLocaleString()}`;
      } else if (benefit.total_limit_count) {
        limitDisplay = `${benefit.total_limit_count} visits`;
      }

      // Determine remaining display
      let remainingDisplay = 'Unlimited';
      if (limit > 0) {
        remainingDisplay = `R${remaining.toLocaleString()}`;
      } else if (benefit.total_limit_count) {
        const remainingCount = benefit.total_limit_count - usedCount;
        remainingDisplay = `${Math.max(0, remainingCount)} visits`;
      }

      benefits[benefit.type] = {
        name: benefit.name,
        limit: limitDisplay,
        limitAmount: limit,
        used: used,
        usedCount: usedCount,
        remaining: remainingDisplay,
        remainingAmount: remaining,
        coverAmount: benefit.cover_amount || 0,
        waitingPeriodDays: benefit.waiting_period_days || 0,
        preExistingExclusionDays: benefit.pre_existing_exclusion_days || 0,
        description: benefit.description,
        lastClaimDate: usage?.last_claim_date || null,
        usagePercentage: limit > 0 ? Math.round((used / limit) * 100) : 0
      };
    }

    return benefits;
  } catch (error) {
    console.error('Error fetching benefit information:', error);
    return benefits;
  }
}
