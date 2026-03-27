import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all claims and calculate stats
    const { data: allClaims, error } = await supabase
      .from('claims')
      .select('id, status, pre_auth_required, fraud_alert_triggered, claimed_amount, approved_at');

    if (error) throw error;

    const claims = allClaims || [];
    
    // Calculate stats
    const pendingClaims = claims.filter(c => c.status === 'pending').length;
    const preauthRequests = claims.filter(c => c.pre_auth_required === true && c.status === 'pending').length;
    const fraudCases = claims.filter(c => c.fraud_alert_triggered === true).length;
    
    // Get today's date at midnight
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const approvedTodayClaims = claims.filter(c => 
      c.status === 'approved' && 
      c.approved_at && 
      new Date(c.approved_at) >= todayStart
    );
    
    const totalApprovedAmount = approvedTodayClaims.reduce(
      (sum, claim) => sum + parseFloat(claim.claimed_amount || '0'), 
      0
    );

    return NextResponse.json({
      pendingClaims,
      preauthRequests,
      fraudCases,
      approvedToday: approvedTodayClaims.length,
      approvedTodayAmount: totalApprovedAmount
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
