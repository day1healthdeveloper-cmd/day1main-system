import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobileNumber, currentPlan, upgradedPlan, memberData } = body;

    // Validate required fields
    if (!mobileNumber || !currentPlan || !upgradedPlan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Store upgrade request in database
    // For now, we'll just log it and return success
    console.log('Plus1 Upgrade Request:', {
      mobileNumber,
      currentPlan,
      upgradedPlan,
      memberName: `${memberData?.firstName} ${memberData?.lastName}`,
      timestamp: new Date().toISOString(),
    });

    // In a real implementation, you would:
    // 1. Create an upgrade_requests table
    // 2. Store the upgrade request with status 'pending'
    // 3. Send notification to admin team
    // 4. Send confirmation email/SMS to member
    
    // Example (commented out - table doesn't exist yet):
    /*
    const { data, error } = await supabaseAdmin
      .from('plus1_upgrade_requests')
      .insert({
        mobile_number: mobileNumber,
        current_plan: currentPlan,
        upgraded_plan: upgradedPlan,
        member_first_name: memberData?.firstName,
        member_last_name: memberData?.lastName,
        member_email: memberData?.email,
        status: 'pending',
        requested_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error storing upgrade request:', error);
      return NextResponse.json(
        { error: 'Failed to store upgrade request' },
        { status: 500 }
      );
    }
    */

    return NextResponse.json({
      success: true,
      message: 'Upgrade request submitted successfully',
    });
  } catch (error) {
    console.error('Error processing upgrade request:', error);
    return NextResponse.json(
      { error: 'Failed to process upgrade request' },
      { status: 500 }
    );
  }
}
