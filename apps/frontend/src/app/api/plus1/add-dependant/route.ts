import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
      birth_certificate_url,
      marriage_certificate_url,
      current_premium,
      dependant_cost,
      new_premium
    } = body

    // Validation
    if (!mobile_number || !dependant_first_name || !dependant_last_name || 
        !dependant_id_number || !dependant_date_of_birth || !dependant_gender || 
        !dependant_relationship || !current_premium || !dependant_cost || !new_premium) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate relationship
    const validRelationships = ['spouse', 'partner', 'child']
    if (!validRelationships.includes(dependant_relationship.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid relationship. Must be spouse, partner, or child' },
        { status: 400 }
      )
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📝 PLUS1 DEPENDANT REQUEST SUBMISSION')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Mobile:', mobile_number)
    console.log('Dependant:', dependant_first_name, dependant_last_name)
    console.log('Relationship:', dependant_relationship)
    console.log('Current Premium: R', current_premium)
    console.log('Dependant Cost: +R', dependant_cost)
    console.log('New Premium: R', new_premium)

    // Find member in Day1Main database
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('id, member_number, first_name, last_name, email, broker_code')
      .eq('mobile', mobile_number)
      .eq('broker_code', 'POR')
      .single()

    if (memberError || !member) {
      console.error('❌ Member not found:', memberError?.message)
      return NextResponse.json(
        { error: 'Member not found. Please ensure you have an active Plus1Rewards membership.' },
        { status: 404 }
      )
    }

    console.log('✅ Member found:', member.member_number, member.first_name, member.last_name)

    // Create dependant request
    const { data: dependantRequest, error: requestError } = await supabaseAdmin
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
        dependant_relationship: dependant_relationship.toLowerCase(),
        id_document_url,
        birth_certificate_url,
        marriage_certificate_url,
        current_premium,
        dependant_cost,
        new_premium,
        status: 'pending',
        requested_at: new Date().toISOString()
      })
      .select()
      .single()

    if (requestError) {
      console.error('❌ Failed to create dependant request:', requestError)
      throw requestError
    }

    console.log('✅ Dependant request created:', dependantRequest.id)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    return NextResponse.json({
      success: true,
      request_id: dependantRequest.id,
      message: 'Dependant request submitted successfully. Our call centre will contact you shortly to verify the details.'
    })

  } catch (error) {
    console.error('Plus1 add dependant error:', error)
    return NextResponse.json(
      { error: 'Failed to submit dependant request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
