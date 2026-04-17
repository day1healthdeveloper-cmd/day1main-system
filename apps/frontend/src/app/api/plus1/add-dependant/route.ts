import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      mobile_number,
      dependant_first_name,
      dependant_last_name,
      dependant_id_number,
      dependant_date_of_birth,
      dependant_gender,
      dependant_relationship,
      id_document_url,
      current_premium,
      dependant_cost,
      new_premium
    } = body

    // Validate required fields
    if (!mobile_number || !dependant_first_name || !dependant_last_name || 
        !dependant_id_number || !dependant_date_of_birth || !dependant_gender || 
        !dependant_relationship || !current_premium || !dependant_cost || !new_premium) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find member by mobile number
    const { data: members, error: memberError } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, plan_name')
      .eq('mobile', mobile_number)
      .limit(1)

    if (memberError) {
      console.error('Error finding member:', memberError)
      return NextResponse.json(
        { error: 'Failed to find member', details: memberError.message },
        { status: 500 }
      )
    }

    if (!members || members.length === 0) {
      return NextResponse.json(
        { error: 'Member not found with this mobile number' },
        { status: 404 }
      )
    }

    const member = members[0]

    // Insert dependant request
    const { data: dependantRequest, error: insertError } = await supabase
      .from('plus1_dependant_requests')
      .insert({
        member_id: member.id,
        mobile_number,
        member_first_name: member.first_name,
        member_last_name: member.last_name,
        member_email: member.email,
        dependant_first_name,
        dependant_last_name,
        dependant_id_number,
        dependant_date_of_birth,
        dependant_gender,
        dependant_relationship,
        id_document_url,
        current_premium,
        dependant_cost,
        new_premium,
        status: 'pending',
        requested_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating dependant request:', insertError)
      return NextResponse.json(
        { error: 'Failed to create dependant request', details: insertError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Plus1 dependant request submitted: ${mobile_number}`)
    console.log(`   Dependant: ${dependant_first_name} ${dependant_last_name} (${dependant_relationship})`)
    console.log(`   Premium increase: R${dependant_cost} (R${current_premium} → R${new_premium})`)

    return NextResponse.json({
      success: true,
      request_id: dependantRequest.id,
      message: 'Dependant request submitted successfully'
    })

  } catch (error) {
    console.error('Error in add-dependant API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
