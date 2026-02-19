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
    
    // Generate application number
    const appNumber = `APP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    
    // Ensure monthlyPrice is a number
    if (data.monthlyPrice && typeof data.monthlyPrice === 'string') {
      data.monthlyPrice = parseFloat(data.monthlyPrice)
    }
    
    // Handle proof of address - store first document in main field
    let proofOfAddressUrl = data.proofOfAddressUrl
    if (Array.isArray(data.proofOfAddressUrls) && data.proofOfAddressUrls.length > 0) {
      proofOfAddressUrl = data.proofOfAddressUrls[0]
    }
    
    // Ensure debitOrderDay is a number
    if (data.debitOrderDay && typeof data.debitOrderDay === 'string') {
      data.debitOrderDay = parseInt(data.debitOrderDay)
    }
    
    // Step 1: Create or update contact record
    const { data: existingContact } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('email', data.email)
      .single()

    let contactId: string

    if (existingContact) {
      // Update existing contact
      const { data: updatedContact, error: updateError } = await supabaseAdmin
        .from('contacts')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          mobile: data.mobile,
          id_number: data.idNumber,
          is_applicant: true,
          application_submitted_at: new Date().toISOString(),
          marketing_consent: data.marketingConsent || false,
          marketing_consent_date: data.marketingConsentDate,
          email_consent: data.emailConsent || false,
          sms_consent: data.smsConsent || false,
          phone_consent: data.phoneConsent || false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingContact.id)
        .select()
        .single()

      if (updateError) throw updateError
      contactId = updatedContact.id
    } else {
      // Create new contact
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
          source: 'website_application',
          application_submitted_at: new Date().toISOString(),
          marketing_consent: data.marketingConsent || false,
          marketing_consent_date: data.marketingConsentDate,
          email_consent: data.emailConsent || false,
          sms_consent: data.smsConsent || false,
          phone_consent: data.phoneConsent || false,
        })
        .select()
        .single()

      if (createError) throw createError
      contactId = newContact.id
    }

    // Step 2: Create application record
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .insert({
        contact_id: contactId,
        application_number: appNumber,
        first_name: data.firstName,
        last_name: data.lastName,
        id_number: data.idNumber,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        email: data.email,
        mobile: data.mobile,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2,
        city: data.city,
        postal_code: data.postalCode,
        id_document_url: data.idDocumentUrl,
        proof_of_address_url: proofOfAddressUrl,
        selfie_url: data.selfieUrl,
        bank_name: data.bankName,
        account_number: data.accountNumber,
        branch_code: data.branchCode,
        account_holder_name: data.accountHolderName,
        debit_order_day: data.debitOrderDay,
        medical_history: data.medicalHistory,
        voice_recording_url: data.voiceRecordingUrl,
        signature_url: data.signatureUrl,
        terms_accepted_at: new Date().toISOString(),
        terms_ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        terms_user_agent: request.headers.get('user-agent') || 'unknown',
        marketing_consent: data.marketingConsent || false,
        marketing_consent_date: data.marketingConsentDate,
        email_consent: data.emailConsent || false,
        sms_consent: data.smsConsent || false,
        phone_consent: data.phoneConsent || false,
        plan_name: data.planName,
        plan_config: data.planConfig,
        monthly_price: data.monthlyPrice,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (appError) throw appError

    // Step 3: Insert dependents if any
    if (data.dependents && data.dependents.length > 0) {
      const dependentsData = data.dependents.map((dep: any) => ({
        application_id: application.id,
        first_name: dep.firstName,
        last_name: dep.lastName,
        id_number: dep.idNumber,
        date_of_birth: dep.dateOfBirth,
        gender: dep.gender,
        relationship: dep.relationship,
        id_document_url: dep.idDocumentUrl,
        birth_certificate_url: dep.birthCertificateUrl,
      }))

      const { error: depsError } = await supabaseAdmin
        .from('application_dependents')
        .insert(dependentsData)

      if (depsError) throw depsError
    }

    // Step 4: Log contact interaction
    await supabaseAdmin
      .from('contact_interactions')
      .insert({
        contact_id: contactId,
        interaction_type: 'application_submitted',
        interaction_date: new Date().toISOString(),
        notes: `Application ${appNumber} submitted`,
        metadata: {
          application_id: application.id,
          application_number: appNumber,
          plan_id: data.planId,
          plan_name: data.planName,
        },
      })

    return NextResponse.json({
      success: true,
      applicationNumber: appNumber,
      applicationId: application.id,
      contactId,
    })
  } catch (error) {
    console.error('Application submission error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return NextResponse.json(
      { 
        error: 'Failed to submit application', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
