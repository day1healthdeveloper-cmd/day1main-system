import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch pending applications
    const { data: applications, error } = await supabaseAdmin
      .from('applications')
      .select('id, application_number, first_name, last_name, plan_name, submitted_at, monthly_price')
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pending approvals' },
        { status: 500 }
      );
    }

    // Transform to match the PendingApproval interface
    const pendingApprovals = (applications || []).map((app) => {
      const submittedDate = new Date(app.submitted_at);
      const now = new Date();
      const hoursSinceSubmission = Math.floor((now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60));
      
      // Determine priority based on how long it's been pending
      let priority: 'low' | 'medium' | 'high' = 'medium';
      if (hoursSinceSubmission > 48) {
        priority = 'high';
      } else if (hoursSinceSubmission < 24) {
        priority = 'low';
      }

      return {
        id: app.id,
        type: 'policy' as const,
        title: `Application: ${app.first_name} ${app.last_name}`,
        description: `${app.plan_name || 'Medical Plan'} - ${app.application_number}${app.monthly_price ? ` - R${app.monthly_price}/month` : ''}`,
        submittedBy: 'Member Application',
        submittedDate: app.submitted_at,
        priority,
      };
    });

    return NextResponse.json(pendingApprovals);
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending approvals' },
      { status: 500 }
    );
  }
}
