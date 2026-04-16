import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mobile = searchParams.get('mobile')

    if (!mobile) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      )
    }

    // Check if environment variables are set
    if (!process.env.PLUS1_SUPABASE_URL || !process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Plus1 Supabase credentials not configured')
      return NextResponse.json(
        { error: 'External database not configured' },
        { status: 500 }
      )
    }

    // Initialize Plus1Rewards Supabase client
    const plus1Supabase = createClient(
      process.env.PLUS1_SUPABASE_URL,
      process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'x-application-name': 'day1main-plus1-integration'
          }
        }
      }
    )

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 SEARCHING FOR PLUS1 MEMBER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Mobile:', mobile);

    // STEP 1: Search Plus1Rewards database
    console.log('\n📍 STEP 1: Checking Plus1Rewards database...');
    const { data: members, error } = await plus1Supabase
      .from('members')
      .select('first_name, last_name, sa_id, date_of_birth, email, cell_phone, address_line_1, city, postal_code, cover_plan_name, cover_plan_price')
      .eq('cell_phone', mobile)
      .limit(1)

    if (error) {
      console.error('❌ Plus1Rewards search error:', error)
      return NextResponse.json(
        { error: 'Failed to search Plus1Rewards database', details: error.message },
        { status: 500 }
      )
    }

    if (!members || members.length === 0) {
      console.log('❌ Member NOT found in Plus1Rewards database');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return NextResponse.json(
        { found: false, message: 'Member not found in Plus1Rewards' },
        { status: 200 }
      )
    }

    const member = members[0]
    console.log('✅ Found in Plus1Rewards:', member.first_name, member.last_name);

    // STEP 2: Verify member exists in Day1Main database
    console.log('\n📍 STEP 2: Verifying member in Day1Main database...');
    console.log('Query: mobile =', mobile, '+ broker_code = POR');
    
    const day1Supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: day1Member, error: day1Error } = await day1Supabase
      .from('members')
      .select('id, member_number, first_name, last_name, id_number, date_of_birth, gender, email, mobile, address_line1, city, postal_code, plan_name, monthly_premium, status, start_date, broker_code')
      .eq('mobile', mobile)
      .eq('broker_code', 'POR')
      .single();

    if (day1Error || !day1Member) {
      console.error('❌ Member NOT found in Day1Main database');
      console.error('Error:', day1Error?.message || 'No member with this mobile + broker POR');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return NextResponse.json(
        { 
          found: false, 
          message: 'Member not found in Day1Main database. Please ensure member has been approved first.',
          inPlus1: true,
          inDay1Main: false
        },
        { status: 404 }
      )
    }

    console.log('✅ Found in Day1Main database');
    console.log('Member Number:', day1Member.member_number);
    console.log('Member ID:', day1Member.id);
    console.log('Name:', day1Member.first_name, day1Member.last_name);
    console.log('Plan:', day1Member.plan_name);
    console.log('Premium:', day1Member.monthly_premium);
    console.log('Status:', day1Member.status);
    console.log('Broker Code:', day1Member.broker_code);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ MEMBER VERIFIED IN BOTH DATABASES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Return complete member data from Day1Main database
    return NextResponse.json({
      found: true,
      member: {
        // Day1Main data (primary source)
        memberId: day1Member.id,
        memberNumber: day1Member.member_number,
        firstName: day1Member.first_name || '',
        lastName: day1Member.last_name || '',
        idNumber: day1Member.id_number || '',
        dateOfBirth: day1Member.date_of_birth || '',
        gender: day1Member.gender || '',
        email: day1Member.email || '',
        mobile: day1Member.mobile || '',
        addressLine1: day1Member.address_line1 || '',
        city: day1Member.city || '',
        postalCode: day1Member.postal_code || '',
        currentPlan: day1Member.plan_name || '',
        currentPremium: day1Member.monthly_premium || 0,
        status: day1Member.status || '',
        startDate: day1Member.start_date || '',
        brokerCode: day1Member.broker_code || '',
      }
    })

  } catch (error) {
    console.error('Plus1 search error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
