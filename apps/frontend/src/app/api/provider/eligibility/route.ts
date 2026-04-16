import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function extractBenefitInfo(item: any): any {
  const content = item.content || '';
  const title = item.title || '';
  
  // Try to extract monetary limits (R1000, R 1,000, etc.)
  const moneyMatch = content.match(/R\s*[\d,]+/i);
  if (moneyMatch) {
    const amount = parseInt(moneyMatch[0].replace(/[R,\s]/g, ''));
    return {
      limit: amount,
      used: 0,
      remaining: amount,
    };
  }
  
  // Check for unlimited
  if (content.includes('unlimited') || content.includes('no limit')) {
    return {
      limit: 'Unlimited',
      used: 0,
      remaining: 'Unlimited',
    };
  }
  
  // Check for visit limits (5 visits, etc.)
  const visitMatch = content.match(/(\d+)\s*visit/i);
  if (visitMatch) {
    const visits = parseInt(visitMatch[1]);
    return {
      limit: visits,
      used: 0,
      remaining: visits,
    };
  }
  
  // Default
  return {
    limit: 'See policy',
    used: 0,
    remaining: 'See policy',
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberNumber, idNumber } = body;

    if (!memberNumber && !idNumber) {
      return NextResponse.json(
        { error: 'Member number or ID number is required' },
        { status: 400 }
      );
    }

    console.log('Searching for member:', { memberNumber, idNumber });

    // Find member by member number or ID number
    let query = supabase
      .from('members')
      .select('*');

    if (memberNumber) {
      query = query.eq('member_number', memberNumber);
    } else if (idNumber) {
      query = query.eq('id_number', idNumber);
    }

    const { data: members, error: memberError } = await query;

    console.log('Member query result:', { members, memberError });

    if (memberError) {
      console.error('Database error:', memberError);
      return NextResponse.json(
        { error: 'Database error: ' + memberError.message, eligible: false },
        { status: 500 }
      );
    }

    if (!members || members.length === 0) {
      return NextResponse.json(
        { error: 'Member not found in database', eligible: false },
        { status: 404 }
      );
    }

    const member = members[0];
    console.log('Found member:', member);

    // Get policy if policy_id exists
    let policy = null;
    if (member.policy_id) {
      const { data: policyData } = await supabase
        .from('policies')
        .select('*')
        .eq('id', member.policy_id)
        .single();
      
      policy = policyData;
    }

    console.log('Policy data:', policy);

    // Check if member is active
    const isActive = member.status === 'active';
    
    // Check if policy is active
    const isPolicyActive = policy?.status === 'active';
    
    // Check if policy is within date range
    const today = new Date();
    const startDate = policy?.start_date ? new Date(policy.start_date) : null;
    const endDate = policy?.end_date ? new Date(policy.end_date) : null;
    
    const isWithinDateRange = startDate && endDate
      ? today >= startDate && today <= endDate
      : false;

    // Determine eligibility
    const eligible = isActive && isPolicyActive && isWithinDateRange;

    // Get real benefit usage data
    const currentYear = new Date().getFullYear();
    
    // Initialize benefits for this member if not exists
    if (member.plan_id) {
      await supabase.rpc('initialize_member_benefits', {
        p_member_id: member.id,
        p_year: currentYear
      });
    }
    
    // Fetch benefit usage
    const { data: benefitUsage } = await supabase
      .from('benefit_usage')
      .select('*')
      .eq('member_id', member.id)
      .eq('year', currentYear);
    
    // Transform to benefits object
    let benefits: any = {};
    
    if (benefitUsage && benefitUsage.length > 0) {
      benefitUsage.forEach((usage: any) => {
        benefits[usage.benefit_type] = {
          limit: usage.total_limit_count || usage.total_limit_amount || 'Unlimited',
          used: usage.used_count || usage.used_amount || 0,
          remaining: usage.remaining_count !== null 
            ? usage.remaining_count 
            : usage.remaining_amount !== null 
              ? usage.remaining_amount 
              : 'Unlimited'
        };
      });
    } else {
      // Fallback to default benefits
      benefits = {
        gp_visits: { limit: 'Unlimited', used: 0, remaining: 'Unlimited' },
        specialist_visits: { limit: 5, used: 0, remaining: 5 },
        dental: { limit: 2000, used: 0, remaining: 2000 },
        optical: { limit: 1000, used: 0, remaining: 1000 },
        hospital: { limit: 'R500,000', used: 0, remaining: 'R500,000' },
      };
    }

    // Fetch real benefits from policy_section_items if policy and plan_type exist
    if (policy && policy.plan_type) {
      const { data: productData } = await supabase
        .from('products')
        .select('id')
        .eq('name', policy.plan_type)
        .single();

      if (productData) {
        // Fetch benefits from policy_section_items (insuring-section)
        const { data: insuringSectionItems } = await supabase
          .from('policy_section_items')
          .select('*')
          .eq('product_id', productData.id)
          .eq('section_type', 'insuring-section')
          .order('display_order');

        if (insuringSectionItems && insuringSectionItems.length > 0) {
          console.log(`Found ${insuringSectionItems.length} benefit items for ${policy.plan_type}`);
          
          // Parse benefit items to extract limits
          const benefitsMap: any = {};
          
          insuringSectionItems.forEach((item: any) => {
            const title = item.title?.toLowerCase() || '';
            const content = item.content?.toLowerCase() || '';
            
            // Try to match benefit types and extract limits
            if (title.includes('general practitioner') || title.includes('gp')) {
              benefitsMap.gp_visits = extractBenefitInfo(item);
            } else if (title.includes('specialist')) {
              benefitsMap.specialist_visits = extractBenefitInfo(item);
            } else if (title.includes('dental')) {
              benefitsMap.dental = extractBenefitInfo(item);
            } else if (title.includes('optical') || title.includes('optometry')) {
              benefitsMap.optical = extractBenefitInfo(item);
            } else if (title.includes('hospital')) {
              benefitsMap.hospital = extractBenefitInfo(item);
            }
          });

          benefits = { ...benefits, ...benefitsMap };
        }
      }
    }

    // Calculate real waiting periods based on member start date
    const startDate = member.start_date ? new Date(member.start_date) : new Date();
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const waitingPeriods = {
      general: {
        completed: daysSinceStart >= 90, // 3 months
        daysRemaining: Math.max(0, 90 - daysSinceStart),
      },
      specialist: {
        completed: daysSinceStart >= 90, // 3 months
        daysRemaining: Math.max(0, 90 - daysSinceStart),
      },
      hospital: {
        completed: daysSinceStart >= 90, // 3 months
        daysRemaining: Math.max(0, 90 - daysSinceStart),
      },
      maternity: {
        completed: daysSinceStart >= 365, // 12 months
        daysRemaining: Math.max(0, 365 - daysSinceStart),
      },
    };

    return NextResponse.json({
      eligible,
      member: {
        id: member.id,
        memberNumber: member.member_number,
        firstName: member.first_name,
        lastName: member.last_name,
        idNumber: member.id_number,
        dateOfBirth: member.date_of_birth,
        status: member.status,
      },
      policy: policy ? {
        policyNumber: policy.policy_number,
        status: policy.status,
        planType: policy.plan_type,
        startDate: policy.start_date,
        endDate: policy.end_date,
        isActive: isPolicyActive,
        isWithinDateRange,
      } : {
        policyNumber: 'No policy linked',
        status: 'inactive',
        planType: '-',
        startDate: null,
        endDate: null,
        isActive: false,
        isWithinDateRange: false,
      },
      benefits,
      waitingPeriods,
      message: eligible
        ? 'Member is eligible for treatment'
        : !policy 
          ? 'Member found but no policy linked'
          : !isActive
            ? 'Member status is not active'
            : !isPolicyActive
              ? 'Policy is not active'
              : !isWithinDateRange
                ? 'Policy is not within valid date range'
                : 'Member is not eligible. Please check status and policy details.',
    });
  } catch (error: any) {
    console.error('Error checking eligibility:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check eligibility' },
      { status: 500 }
    );
  }
}
