import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const alerts = [];

    // Check for failed debit orders in last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: failedPayments, error: paymentError } = await supabaseAdmin
      .from('payment_history')
      .select('id')
      .eq('status', 'failed')
      .gte('created_at', yesterday.toISOString());

    if (!paymentError && failedPayments && failedPayments.length > 0) {
      alerts.push({
        id: 'failed-payments',
        type: 'error',
        title: 'Failed Debit Orders',
        message: `${failedPayments.length} debit order${failedPayments.length > 1 ? 's' : ''} failed in the last 24 hours`,
        timestamp: new Date().toISOString(),
      });
    }

    // Check for high-value claims pending review
    const { data: highValueClaims, error: claimsError } = await supabaseAdmin
      .from('claims')
      .select('id, claimed_amount')
      .eq('status', 'pending')
      .gte('claimed_amount', 50000);

    if (!claimsError && highValueClaims && highValueClaims.length > 0) {
      alerts.push({
        id: 'high-value-claims',
        type: 'warning',
        title: 'High-Value Claims Pending',
        message: `${highValueClaims.length} claim${highValueClaims.length > 1 ? 's' : ''} over R50,000 awaiting review`,
        timestamp: new Date().toISOString(),
      });
    }

    // Check for open fraud alerts
    const { data: fraudAlerts, error: fraudError } = await supabaseAdmin
      .from('provider_fraud_alerts')
      .select('id, severity')
      .eq('status', 'open')
      .in('severity', ['high', 'critical']);

    if (!fraudError && fraudAlerts && fraudAlerts.length > 0) {
      alerts.push({
        id: 'fraud-alerts',
        type: 'error',
        title: 'Provider Fraud Alerts',
        message: `${fraudAlerts.length} high-priority fraud alert${fraudAlerts.length > 1 ? 's' : ''} require investigation`,
        timestamp: new Date().toISOString(),
      });
    }

    // Check for pending claims approaching 30-day limit
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const twentyFiveDaysAgo = new Date();
    twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);

    const { data: oldPendingClaims, error: oldClaimsError } = await supabaseAdmin
      .from('claims')
      .select('id')
      .eq('status', 'pending')
      .lte('submission_date', twentyFiveDaysAgo.toISOString())
      .gte('submission_date', thirtyDaysAgo.toISOString());

    if (!oldClaimsError && oldPendingClaims && oldPendingClaims.length > 0) {
      alerts.push({
        id: 'aging-claims',
        type: 'warning',
        title: 'Claims Approaching 30-Day Limit',
        message: `${oldPendingClaims.length} claim${oldPendingClaims.length > 1 ? 's' : ''} pending for 25+ days (statutory limit: 30 days)`,
        timestamp: new Date().toISOString(),
      });
    }

    // If no alerts, add a positive message
    if (alerts.length === 0) {
      alerts.push({
        id: 'all-clear',
        type: 'info',
        title: 'All Systems Operational',
        message: 'No critical alerts at this time',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}
