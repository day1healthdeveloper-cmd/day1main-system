import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Fetch fresh member data from database
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('id, member_number, first_name, last_name, email, mobile, status, broker_code, plan_name, plan_id, monthly_premium, next_debit_date, start_date')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Return fresh member data
    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        member_number: member.member_number,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        mobile: member.mobile,
        broker_code: member.broker_code,
        plan_name: member.plan_name,
        plan_id: member.plan_id,
        monthly_premium: member.monthly_premium,
        next_debit_date: member.next_debit_date,
        start_date: member.start_date,
        status: member.status
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
}
