import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const cookieStore = cookies();
    const userIdCookie = cookieStore.get('user-id');
    
    if (!userIdCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = userIdCookie.value;

    // Get member ID
    const { data: member } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Get claims stats
    const { data: claims } = await supabaseAdmin
      .from('claims')
      .select('status, claimed_amount, approved_at')
      .eq('member_id', member.id);

    const activeClaims = claims?.filter(c => c.status === 'pending' || c.status === 'pended').length || 0;
    const pendingClaims = claims?.filter(c => c.status === 'pending').length || 0;
    
    const approvedClaims = claims?.filter(c => c.status === 'approved') || [];
    const totalClaimsPaid = approvedClaims.reduce((sum, c) => sum + parseFloat(c.claimed_amount || '0'), 0);

    // Get last payment
    const { data: lastPayment } = await supabaseAdmin
      .from('payment_history')
      .select('payment_date, amount')
      .eq('member_id', member.id)
      .eq('status', 'success')
      .order('payment_date', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      activeClaims,
      pendingClaims,
      totalClaimsPaid,
      lastPaymentDate: lastPayment?.payment_date || null,
      lastPaymentAmount: lastPayment?.amount || null,
    });
  } catch (error) {
    console.error('Error fetching member stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member stats' },
      { status: 500 }
    );
  }
}
