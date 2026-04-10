import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Activity {
  id: string;
  type: 'member' | 'policy' | 'claim' | 'payment' | 'provider';
  action: string;
  description: string;
  timestamp: string;
  user: string;
}

export async function GET() {
  try {
    const activities: Activity[] = [];

    // Fetch recent member registrations
    const { data: members, error: membersError } = await supabaseAdmin
      .from('members')
      .select('id, member_number, first_name, last_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!membersError && members) {
      members.forEach((member) => {
        activities.push({
          id: `member-${member.id}`,
          type: 'member',
          action: 'Member Registered',
          description: `${member.first_name} ${member.last_name} - ${member.member_number}`,
          timestamp: member.created_at,
          user: 'System',
        });
      });
    }

    // Fetch recent approved claims
    const { data: claims, error: claimsError } = await supabaseAdmin
      .from('claims')
      .select('id, claim_number, claimed_amount, approved_at, status')
      .eq('status', 'approved')
      .not('approved_at', 'is', null)
      .order('approved_at', { ascending: false })
      .limit(5);

    if (!claimsError && claims) {
      claims.forEach((claim) => {
        activities.push({
          id: `claim-${claim.id}`,
          type: 'claim',
          action: 'Claim Approved',
          description: `${claim.claim_number} - R${parseFloat(claim.claimed_amount).toLocaleString()}`,
          timestamp: claim.approved_at,
          user: 'Claims Assessor',
        });
      });
    }

    // Fetch recent successful payments
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payment_history')
      .select('id, amount, payment_date, member_id')
      .eq('status', 'success')
      .not('payment_date', 'is', null)
      .order('payment_date', { ascending: false })
      .limit(5);

    if (!paymentsError && payments) {
      payments.forEach((payment) => {
        activities.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          action: 'Payment Processed',
          description: `Payment received - R${parseFloat(payment.amount).toLocaleString()}`,
          timestamp: payment.payment_date,
          user: 'Finance System',
        });
      });
    }

    // Fetch recent approved providers
    const { data: providers, error: providersError } = await supabaseAdmin
      .from('providers')
      .select('id, name, type, created_at, status')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(3);

    if (!providersError && providers) {
      providers.forEach((provider) => {
        activities.push({
          id: `provider-${provider.id}`,
          type: 'provider',
          action: 'Provider Approved',
          description: `${provider.name} - ${provider.type}`,
          timestamp: provider.created_at,
          user: 'Provider Manager',
        });
      });
    }

    // Sort all activities by timestamp (most recent first) and limit to 10
    activities.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });

    const recentActivities = activities.slice(0, 10);

    return NextResponse.json(recentActivities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
