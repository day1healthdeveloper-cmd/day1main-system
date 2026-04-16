import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/member/benefits/usage
 * 
 * Fetch benefit usage for a member for the current year
 * 
 * Query Parameters:
 * - member_id (required): Member ID
 * - year (optional): Year to fetch usage for (defaults to current year)
 * - benefit_type (optional): Specific benefit type to fetch
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('member_id');
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const benefitType = searchParams.get('benefit_type');

    if (!memberId) {
      return NextResponse.json(
        { error: 'member_id is required' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabaseAdmin
      .from('benefit_usage')
      .select('*')
      .eq('member_id', memberId)
      .eq('year', parseInt(year));

    if (benefitType) {
      query = query.eq('benefit_type', benefitType);
    }

    const { data, error } = await query.order('benefit_type');

    if (error) {
      console.error('Error fetching benefit usage:', error);
      return NextResponse.json(
        { error: 'Failed to fetch benefit usage' },
        { status: 500 }
      );
    }

    return NextResponse.json({ usage: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/member/benefits/usage
 * 
 * Initialize or update benefit usage for a member
 * 
 * Body:
 * - member_id (required): Member ID
 * - benefit_type (required): Type of benefit
 * - year (optional): Year (defaults to current year)
 * - total_limit_amount (optional): Annual limit amount
 * - total_limit_count (optional): Annual limit count
 * - used_amount (optional): Amount used (for updates)
 * - used_count (optional): Count used (for updates)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      member_id,
      benefit_type,
      year = new Date().getFullYear(),
      total_limit_amount,
      total_limit_count,
      used_amount = 0,
      used_count = 0,
    } = body;

    if (!member_id || !benefit_type) {
      return NextResponse.json(
        { error: 'member_id and benefit_type are required' },
        { status: 400 }
      );
    }

    // Check if record exists
    const { data: existing } = await supabaseAdmin
      .from('benefit_usage')
      .select('*')
      .eq('member_id', member_id)
      .eq('benefit_type', benefit_type)
      .eq('year', year)
      .single();

    if (existing) {
      // Update existing record
      const { data, error } = await supabaseAdmin
        .from('benefit_usage')
        .update({
          used_amount,
          used_count,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating benefit usage:', error);
        return NextResponse.json(
          { error: 'Failed to update benefit usage' },
          { status: 500 }
        );
      }

      return NextResponse.json({ usage: data });
    } else {
      // Create new record
      const { data, error } = await supabaseAdmin
        .from('benefit_usage')
        .insert({
          member_id,
          benefit_type,
          year,
          total_limit_amount,
          total_limit_count,
          used_amount,
          used_count,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating benefit usage:', error);
        return NextResponse.json(
          { error: 'Failed to create benefit usage' },
          { status: 500 }
        );
      }

      return NextResponse.json({ usage: data }, { status: 201 });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/member/benefits/usage
 * 
 * Increment benefit usage when a claim is approved
 * 
 * Body:
 * - member_id (required): Member ID
 * - benefit_type (required): Type of benefit
 * - amount (required): Amount to add to used_amount
 * - year (optional): Year (defaults to current year)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      member_id,
      benefit_type,
      amount,
      year = new Date().getFullYear(),
    } = body;

    if (!member_id || !benefit_type || amount === undefined) {
      return NextResponse.json(
        { error: 'member_id, benefit_type, and amount are required' },
        { status: 400 }
      );
    }

    // Get current usage
    const { data: existing } = await supabaseAdmin
      .from('benefit_usage')
      .select('*')
      .eq('member_id', member_id)
      .eq('benefit_type', benefit_type)
      .eq('year', year)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Benefit usage record not found. Initialize it first.' },
        { status: 404 }
      );
    }

    // Increment usage
    const newUsedAmount = (existing.used_amount || 0) + amount;
    const newUsedCount = (existing.used_count || 0) + 1;

    const { data, error } = await supabaseAdmin
      .from('benefit_usage')
      .update({
        used_amount: newUsedAmount,
        used_count: newUsedCount,
        last_claim_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error incrementing benefit usage:', error);
      return NextResponse.json(
        { error: 'Failed to increment benefit usage' },
        { status: 500 }
      );
    }

    return NextResponse.json({ usage: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
