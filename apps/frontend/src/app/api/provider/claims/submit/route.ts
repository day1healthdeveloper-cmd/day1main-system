import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    const {
      providerId,
      memberNumber,
      patientName,
      idNumber,
      benefitType,
      claimType,
      formData,
      totalAmount,
      documentUrls
    } = body;

    // Extract service date from formData (different field names for different claim types)
    const serviceDate = formData.serviceDate || formData.admissionDate || new Date().toISOString().split('T')[0];

    // Find member by member_number
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id')
      .eq('member_number', memberNumber)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found. Please verify the member number.' },
        { status: 404 }
      );
    }

    // Generate claim number
    const claimNumber = `CLM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`;

    // Extract ICD-10 codes from formData
    const icd10Codes = formData.diagnosisCode ? [formData.diagnosisCode] : [];
    
    // Extract tariff/procedure codes from formData
    const tariffCodes = formData.procedureCode ? [formData.procedureCode] : [];

    // Create claim with dynamic form data
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert({
        claim_number: claimNumber,
        member_id: member.id,
        provider_id: providerId,
        service_date: serviceDate,
        claim_type: claimType,
        benefit_type: benefitType,
        claimed_amount: totalAmount.toString(),
        status: 'pending',
        submission_date: new Date().toISOString(),
        icd10_codes: icd10Codes,
        tariff_codes: tariffCodes,
        pre_auth_required: false,
        is_pmb: false,
        fraud_alert_triggered: false,
        claim_source: 'provider_portal',
        claim_data: formData, // Store all form data as JSON
        document_urls: documentUrls // Store uploaded document URLs
      })
      .select()
      .single();

    if (claimError) {
      console.error('Error creating claim:', claimError);
      throw claimError;
    }

    // Create audit trail entry
    await supabase.from('claim_audit_trail').insert({
      claim_id: claim.id,
      action: 'submitted',
      performed_by: providerId,
      performed_at: new Date().toISOString(),
      old_status: null,
      new_status: 'pending',
      notes: `Claim submitted via provider portal`
    });

    return NextResponse.json({
      success: true,
      claimNumber: claim.claim_number,
      claimId: claim.id,
      message: 'Claim submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting claim:', error);
    return NextResponse.json(
      { error: 'Failed to submit claim', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
