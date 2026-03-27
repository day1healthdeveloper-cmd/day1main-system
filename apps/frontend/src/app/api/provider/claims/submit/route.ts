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
      serviceDate,
      claimType,
      claimLines,
      totalAmount
    } = body;

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

    // Extract ICD-10 and tariff codes from claim lines
    const icd10Codes = claimLines.map((line: any) => line.diagnosisCode).filter(Boolean);
    const tariffCodes = claimLines.map((line: any) => line.tariffCode).filter(Boolean);

    // Create claim
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert({
        claim_number: claimNumber,
        member_id: member.id,
        provider_id: providerId,
        service_date: serviceDate,
        claim_type: claimType,
        claimed_amount: totalAmount.toString(),
        status: 'pending',
        submission_date: new Date().toISOString(),
        icd10_codes: icd10Codes,
        tariff_codes: tariffCodes,
        pre_auth_required: false,
        is_pmb: false,
        fraud_alert_triggered: false,
        claim_source: 'provider_portal'
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
