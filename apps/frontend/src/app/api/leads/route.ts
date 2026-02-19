import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const data = await request.json()
    
    // Check if contact already exists
    const { data: existingContact } = await supabaseAdmin
      .from('contacts')
      .select('id, lifecycle_stage')
      .eq('email', data.email)
      .single()

    let contactId: string

    if (existingContact) {
      // Only update if they're still a lead (not already an applicant/member)
      if (existingContact.lifecycle_stage === 'new' || existingContact.lifecycle_stage === 'application_started') {
        const { data: updatedContact, error: updateError } = await supabaseAdmin
          .from('contacts')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            mobile: data.mobile,
            id_number: data.idNumber,
            is_lead: true,
            is_applicant: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingContact.id)
          .select()
          .single()

        if (updateError) throw updateError
        contactId = updatedContact.id
      } else {
        // Don't overwrite existing applicant/member data
        contactId = existingContact.id
      }
    } else {
      // Create new contact/lead
      const { data: newContact, error: createError } = await supabaseAdmin
        .from('contacts')
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          mobile: data.mobile,
          id_number: data.idNumber,
          is_lead: true,
          is_applicant: true,
          source: data.source || 'website_application',
        })
        .select()
        .single()

      if (createError) throw createError
      contactId = newContact.id

      // Log interaction for new lead
      await supabaseAdmin
        .from('contact_interactions')
        .insert({
          contact_id: contactId,
          interaction_type: 'application_started',
          interaction_date: new Date().toISOString(),
          notes: 'Started application - completed Step 1 (Personal Information)',
          metadata: {
            step: 1,
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            user_agent: request.headers.get('user-agent') || 'unknown',
          },
        })
    }

    return NextResponse.json({
      success: true,
      contactId,
      message: 'Lead captured successfully',
    })
  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to capture lead', 
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
