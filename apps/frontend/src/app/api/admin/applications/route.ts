import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Fetch all applications with contact information
    const { data: applications, error } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        contact:contacts(
          id,
          email,
          first_name,
          last_name,
          mobile,
          marketing_consent,
          source,
          tags
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Fetch dependents for each application
    const applicationsWithDependents = await Promise.all(
      applications.map(async (app) => {
        const { data: dependents } = await supabaseAdmin
          .from('application_dependents')
          .select('*')
          .eq('application_id', app.id)

        return {
          ...app,
          dependents: dependents || []
        }
      })
    )

    // Get member count (these are approved applications that were moved to members table)
    const { count: memberCount } = await supabaseAdmin
      .from('members')
      .select('*', { count: 'exact', head: true })

    // Calculate stats
    // Note: When applications are approved, they are deleted and moved to members table
    // So the applications table only contains pending/rejected applications
    // Approved count comes from members table
    const stats = {
      total: applications.length + (memberCount || 0), // Current apps + approved (members)
      submitted: applications.filter(a => a.status === 'submitted').length,
      under_review: applications.filter(a => a.status === 'under_review').length,
      approved: memberCount || 0, // Approved applications are now members
      rejected: applications.filter(a => a.status === 'rejected').length,
    }

    return NextResponse.json({ 
      applications: applicationsWithDependents, 
      stats 
    })
  } catch (error) {
    console.error('Failed to fetch applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationId, status, reviewNotes, rejectionReason, reviewedBy } = body

    // Get the application data first
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      throw new Error('Application not found')
    }

    // Update application status
    const { data, error } = await supabaseAdmin
      .from('applications')
      .update({
        status,
        review_notes: reviewNotes,
        rejection_reason: rejectionReason,
        reviewed_by: reviewedBy || null, // Allow null if no user ID provided
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) throw error

    // If approved, create member record
    if (status === 'approved') {
      // Generate member number
      const memberNumber = `MEM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      
      // Create member record - EXACT COPY of ALL application fields
      const { data: member, error: memberError } = await supabaseAdmin
        .from('members')
        .insert({
          // System fields
          member_number: memberNumber,
          contact_id: application.contact_id,
          application_id: application.id,
          application_number: application.application_number,
          approved_at: new Date().toISOString(),
          approved_by: reviewedBy || null,
          
          // Step 1: Personal Information
          id_number: application.id_number,
          first_name: application.first_name,
          last_name: application.last_name,
          email: application.email,
          phone: application.mobile,
          mobile: application.mobile,
          date_of_birth: application.date_of_birth,
          gender: application.gender,
          address_line1: application.address_line1,
          address_line2: application.address_line2,
          city: application.city,
          postal_code: application.postal_code,
          
          // Step 2: Documents (EXACT COPY)
          id_document_url: application.id_document_url,
          id_document_ocr_data: application.id_document_ocr_data,
          proof_of_address_url: application.proof_of_address_url,
          proof_of_address_ocr_data: application.proof_of_address_ocr_data,
          selfie_url: application.selfie_url,
          face_verification_result: application.face_verification_result,
          
          // Step 3: Dependents (copied separately below)
          
          // Step 4: Medical History (EXACT COPY)
          medical_history: application.medical_history,
          
          // Step 5: Banking Details
          bank_name: application.bank_name,
          account_number: application.account_number,
          branch_code: application.branch_code,
          account_holder_name: application.account_holder_name,
          debit_order_day: application.debit_order_day,
          
          // Step 6: Terms & Consent (EXACT COPY)
          voice_recording_url: application.voice_recording_url,
          signature_url: application.signature_url,
          terms_accepted_at: application.terms_accepted_at,
          terms_ip_address: application.terms_ip_address,
          terms_user_agent: application.terms_user_agent,
          marketing_consent: application.marketing_consent,
          marketing_consent_date: application.marketing_consent_date,
          email_consent: application.email_consent,
          sms_consent: application.sms_consent,
          phone_consent: application.phone_consent,
          
          // Plan Information
          plan_id: application.plan_name?.toLowerCase().replace(/\s+/g, '-') || null, // Derive from plan_name
          plan_name: application.plan_name,
          plan_config: application.plan_config,
          monthly_premium: application.monthly_price,
          start_date: new Date().toISOString(),
          
          // Underwriting & Review
          underwriting_status: application.underwriting_status,
          underwriting_notes: application.underwriting_notes,
          risk_rating: application.risk_rating,
          review_notes: reviewNotes,
          
          // Member Status
          status: 'active',
          kyc_status: 'pending',
        })
        .select()
        .single()

      if (memberError) {
        console.error('Failed to create member:', memberError)
        throw new Error(`Failed to create member: ${memberError.message}`)
      }

      // Copy dependents to member_dependents if any
      const { data: appDependents } = await supabaseAdmin
        .from('application_dependents')
        .select('*')
        .eq('application_id', applicationId)

      if (appDependents && appDependents.length > 0) {
        const memberDependents = appDependents.map(dep => ({
          member_id: member.id,
          first_name: dep.first_name,
          last_name: dep.last_name,
          id_number: dep.id_number,
          date_of_birth: dep.date_of_birth,
          gender: dep.gender,
          relationship: dep.relationship,
        }))

        await supabaseAdmin
          .from('member_dependents')
          .insert(memberDependents)
      }

      // Update contact to mark as member
      await supabaseAdmin
        .from('contacts')
        .update({
          is_member: true,
          member_id: member.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', application.contact_id)

      // Log contact interaction
      await supabaseAdmin
        .from('contact_interactions')
        .insert({
          contact_id: application.contact_id,
          interaction_type: 'application_approved',
          interaction_date: new Date().toISOString(),
          notes: `Application ${application.application_number} approved. Member ${memberNumber} created.`,
          metadata: {
            application_id: applicationId,
            member_id: member.id,
            member_number: memberNumber,
          },
        })

      // DELETE APPLICATION DATA after successful member creation
      // First delete dependents
      await supabaseAdmin
        .from('application_dependents')
        .delete()
        .eq('application_id', applicationId)

      // Then delete the application
      await supabaseAdmin
        .from('applications')
        .delete()
        .eq('id', applicationId)

      console.log(`✅ Application ${application.application_number} deleted after successful approval`)

      return NextResponse.json({ 
        application: data,
        member: member,
        message: `Application approved, member ${memberNumber} created, and application data deleted successfully`
      })
    }

    // If rejected, update contact
    if (status === 'rejected') {
      await supabaseAdmin
        .from('contacts')
        .update({
          is_rejected: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.contact_id)

      // Log contact interaction
      await supabaseAdmin
        .from('contact_interactions')
        .insert({
          contact_id: application.contact_id,
          interaction_type: 'application_rejected',
          interaction_date: new Date().toISOString(),
          notes: `Application ${application.application_number} rejected. Reason: ${rejectionReason || 'Not specified'}`,
          metadata: {
            application_id: applicationId,
            rejection_reason: rejectionReason,
          },
        })
    }

    return NextResponse.json({ application: data })
  } catch (error) {
    console.error('Failed to update application:', error)
    return NextResponse.json(
      { error: 'Failed to update application', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
