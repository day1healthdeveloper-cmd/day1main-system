import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET - Fetch single claim details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const claimId = params.id;

    // Fetch claim with all related data
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select(`
        *,
        members (
          member_number,
          first_name,
          last_name,
          id_number,
          email,
          mobile,
          plan_name,
          broker_code
        ),
        providers (
          practice_name,
          provider_type,
          practice_number,
          email,
          phone
        ),
        claim_documents (
          id,
          document_type,
          document_url,
          uploaded_at
        )
      `)
      .eq('id', claimId)
      .single();

    if (claimError || !claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Fetch audit trail
    const { data: auditTrail, error: auditError } = await supabase
      .from('claim_audit_trail')
      .select('*')
      .eq('claim_id', claimId)
      .order('created_at', { ascending: false });

    // Fetch payment information if claim is paid
    let paymentInfo = null;
    if (claim.claim_status === 'paid' || claim.claim_status === 'approved') {
      const { data: payment } = await supabase
        .from('claim_payments')
        .select(`
          *,
          payment_batches (
            batch_number,
            batch_date,
            status
          )
        `)
        .eq('claim_id', claimId)
        .single();
      
      paymentInfo = payment;
    }

    // Fetch benefit usage information
    const { data: benefitUsage } = await supabase
      .from('benefit_usage')
      .select('*')
      .eq('member_id', claim.member_id)
      .eq('benefit_type', claim.benefit_type)
      .eq('year', new Date(claim.service_date).getFullYear())
      .single();

    return NextResponse.json({
      claim,
      auditTrail: auditTrail || [],
      paymentInfo,
      benefitUsage
    });

  } catch (error) {
    console.error('Error fetching claim details:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch claim details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
