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
            'x-application-name': 'day1main-plus1-application'
          }
        }
      }
    )

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 SEARCHING FOR PLUS1 APPLICATION MEMBER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Mobile:', mobile);

    // STEP 1: Search Plus1Rewards database
    console.log('\n📍 STEP 1: Checking Plus1Rewards database...');
    const { data: members, error } = await plus1Supabase
      .from('members')
      .select('first_name, last_name, sa_id, date_of_birth, email, cell_phone, address_line_1, city, postal_code, cover_plan_name, cover_plan_price, plan_status')
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

    // STEP 2: Check if member already exists in Day1Main database (should NOT exist for new applications)
    console.log('\n📍 STEP 2: Checking if member already exists in Day1Main...');
    
    const day1Supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check by ID number first (more reliable than mobile)
    const { data: existingMember, error: day1Error } = await day1Supabase
      .from('members')
      .select('id, member_number, first_name, last_name, id_number, mobile, broker_code')
      .or(`id_number.eq.${member.sa_id},mobile.eq.${mobile}`)
      .limit(1);

    if (day1Error) {
      console.error('❌ Error checking Day1Main database:', day1Error.message);
      return NextResponse.json(
        { error: 'Failed to check existing member', details: day1Error.message },
        { status: 500 }
      )
    }

    if (existingMember && existingMember.length > 0) {
      const existing = existingMember[0];
      console.log('❌ Member already exists in Day1Main database');
      console.log('Existing Member Number:', existing.member_number);
      console.log('Existing Name:', existing.first_name, existing.last_name);
      console.log('Existing ID:', existing.id_number);
      console.log('Existing Mobile:', existing.mobile);
      console.log('Existing Broker Code:', existing.broker_code);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      return NextResponse.json(
        { 
          found: false, 
          message: 'Member already exists in Day1Main database. Please use the upgrade process instead.',
          existingMember: {
            memberNumber: existing.member_number,
            name: `${existing.first_name} ${existing.last_name}`,
            brokerCode: existing.broker_code
          }
        },
        { status: 409 } // Conflict
      )
    }

    console.log('✅ Member does NOT exist in Day1Main (good for new application)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PLUS1 MEMBER READY FOR APPLICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Determine gender from SA ID number
    let gender = '';
    if (member.sa_id && member.sa_id.length >= 7) {
      const genderDigit = parseInt(member.sa_id.charAt(6));
      gender = genderDigit >= 5 ? 'male' : 'female';
    }

    // Return member data from Plus1Rewards for new application
    return NextResponse.json({
      found: true,
      member: {
        firstName: member.first_name || '',
        lastName: member.last_name || '',
        idNumber: member.sa_id || '',
        dateOfBirth: member.date_of_birth || '',
        gender: gender,
        email: member.email || '',
        mobile: member.cell_phone || '',
        addressLine1: member.address_line_1 || '',
        city: member.city || '',
        postalCode: member.postal_code || '',
        coverPlanName: member.cover_plan_name || '',
        coverPlanPrice: member.cover_plan_price || '',
        planStatus: member.plan_status || '',
      }
    })

  } catch (error) {
    console.error('Plus1 application search error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}