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

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 PLUS1 UPGRADE REQUEST RECEIVED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Mobile Number:', mobileNumber);
    console.log('Current Plan:', currentPlan);
    console.log('Upgraded Plan:', upgradedPlan);
    console.log('Member Name:', `${memberData?.firstName} ${memberData?.lastName}`);

    // Validate required fields
    if (!mobileNumber || !currentPlan || !upgradedPlan) {
      console.error('❌ VALIDATION FAILED: Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('\n🔍 STEP 1: Searching for member in Day1Main database...');
    console.log('Query: mobile =', mobileNumber, '+ broker_code = POR');

    // Find member by mobile number to get member_id
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('id, member_number, first_name, last_name, email, monthly_premium')
      .eq('mobile', mobileNumber)
      .eq('broker_code', 'POR')
      .single();

    if (memberError) {
      console.error('❌ DATABASE ERROR:', memberError);
      console.error('Error Code:', memberError.code);
      console.error('Error Message:', memberError.message);
      return NextResponse.json(
        { error: 'Database error while searching for member', details: memberError.message },
        { status: 500 }
      );
    }

    if (!member) {
      console.error('❌ MEMBER NOT FOUND');
      console.error('No member exists with:');
      console.error('  - mobile:', mobileNumber);
      console.error('  - broker_code: POR');
      return NextResponse.json(
        { error: 'Member not found with this mobile number' },
        { status: 404 }
      );
    }

    console.log('✅ MEMBER FOUND IN DAY1MAIN DATABASE');
    console.log('Member Number:', member.member_number);
    console.log('Member ID:', member.id);
    console.log('Name:', member.first_name, member.last_name);
    console.log('Current Premium:', member.monthly_premium);

    console.log('\n🔍 STEP 2: Getting upgraded plan price...');
    // Get upgraded plan price from products table
    let upgradedPrice = null;
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('monthly_premium')
      .eq('name', upgradedPlan)
      .single();

    if (!productError && product) {
      upgradedPrice = product.monthly_premium;
      console.log('✅ Upgraded plan price:', upgradedPrice);
    } else {
      console.log('⚠️ Could not find product price, using null');
    }

    console.log('\n💾 STEP 3: Saving upgrade request to database...');
    const upgradeData = {
      member_id: member.id,
      mobile_number: mobileNumber,
      member_first_name: memberData?.firstName || member.first_name,
      member_last_name: memberData?.lastName || member.last_name,
      member_email: memberData?.email || member.email,
      current_plan: currentPlan,
      upgraded_plan: upgradedPlan,
      current_price: member.monthly_premium,
      upgraded_price: upgradedPrice,
      status: 'pending',
      requested_at: new Date().toISOString(),
    };
    
    console.log('Data to insert:', JSON.stringify(upgradeData, null, 2));

    // Store upgrade request in database
    const { data: upgradeRequest, error: insertError } = await supabaseAdmin
      .from('plus1_upgrade_requests')
      .insert(upgradeData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ INSERT FAILED');
      console.error('Error Code:', insertError.code);
      console.error('Error Message:', insertError.message);
      console.error('Error Details:', insertError.details);
      console.error('Error Hint:', insertError.hint);
      return NextResponse.json(
        { error: 'Failed to store upgrade request', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('✅ UPGRADE REQUEST SAVED SUCCESSFULLY');
    console.log('Request ID:', upgradeRequest.id);
    console.log('Status:', upgradeRequest.status);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS - Upgrade request completed');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return NextResponse.json({
      success: true,
      message: 'Upgrade request submitted successfully',
      upgradeRequestId: upgradeRequest.id,
      memberNumber: member.member_number,
    });
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ CRITICAL ERROR');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return NextResponse.json(
      { error: 'Failed to process upgrade request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
