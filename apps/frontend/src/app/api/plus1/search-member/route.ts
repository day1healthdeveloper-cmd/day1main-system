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

    console.log('Searching Plus1 member with mobile:', mobile)

    // Search for member by mobile number in Plus1Rewards database
    const { data: members, error } = await plus1Supabase
      .from('members')
      .select('first_name, last_name, sa_id, date_of_birth, email, cell_phone, address_line_1, city, postal_code')
      .eq('cell_phone', mobile)
      .limit(1)

    if (error) {
      console.error('Plus1 member search error:', error)
      return NextResponse.json(
        { error: 'Failed to search member', details: error.message },
        { status: 500 }
      )
    }

    if (!members || members.length === 0) {
      console.log('No member found with mobile:', mobile)
      return NextResponse.json(
        { found: false, message: 'Member not found' },
        { status: 404 }
      )
    }

    const member = members[0]
    console.log('Member found:', member.first_name, member.last_name)

    // Extract gender from ID number (digits 7-10: 0000-4999 = Female, 5000-9999 = Male)
    let gender = ''
    if (member.sa_id && member.sa_id.length === 13) {
      const genderDigits = parseInt(member.sa_id.substring(6, 10))
      gender = genderDigits < 5000 ? 'female' : 'male'
    }

    // Return member data
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
