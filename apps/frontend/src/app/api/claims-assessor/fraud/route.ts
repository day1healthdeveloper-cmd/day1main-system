import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/lib/auth-server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    await requireAnyRole(request, ['claims', 'admin', 'system_admin']);

    // Fetch claims with fraud alerts
    const { data: claims, error } = await supabaseAdmin
      .from('claims')
      .select(`
        *,
        members:member_id (
          id,
          member_number,
          first_name,
          last_name,
          email,
          mobile,
          plan_name
        ),
        providers:provider_id (
          id,
          provider_number,
          name,
          practice_name,
          type,
          fraud_risk_score
        )
      `)
      .eq('fraud_alert_triggered', true)
      .order('submission_date', { ascending: false });

    if (error) {
      console.error('Error fetching fraud cases:', error);
      return NextResponse.json(
        { error: 'Failed to fetch fraud cases', details: error.message },
        { status: 500 }
      );
    }

    // Also fetch provider fraud alerts
    const { data: providerAlerts, error: alertsError } = await supabaseAdmin
      .from('provider_fraud_alerts')
      .select(`
        *,
        providers:provider_id (
          id,
          provider_number,
          name,
          practice_name,
          type
        )
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (alertsError) {
      console.error('Error fetching provider alerts:', alertsError);
    }

    return NextResponse.json({
      cases: claims || [],
      provider_alerts: providerAlerts || []
    });

  } catch (error: any) {
    console.error('Error in fraud API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
