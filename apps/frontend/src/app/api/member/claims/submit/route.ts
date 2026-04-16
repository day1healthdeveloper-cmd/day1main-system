import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// POST - Submit member refund claim
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    const {
      member_id,
      benefit_type,
      service_date,
      claimed_amount,
      claim_data,
      document_urls,
      submission_type = 'member_refund'
    } = body;

    // Validate required fields
    if (!member_id || !benefit_type || !service_date || !claimed_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate claim number
    const claimNumber = `CLM-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

    // Create claim record
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert({
        claim_number: claimNumber,
        member_id,
        provider_id: null, // Member-submitted refund claim
        benefit_type,
        service_date,
        submission_date: new Date().toISOString(),
        claimed_amount,
        claim_status: 'submitted',
        claim_data,
        submission_type
      })
      .select()
      .single();

    if (claimError) {
      console.error('Error creating claim:', claimError);
      throw claimError;
    }

    // Create document records if documents were uploaded
    if (document_urls && document_urls.length > 0) {
      const documentRecords = document_urls.map((url: string, index: number) => ({
        claim_id: claim.id,
        document_type: `Supporting Document ${index + 1}`,
        document_url: url,
        uploaded_at: new Date().toISOString()
      }));

      const { error: docsError } = await supabase
        .from('claim_documents')
        .insert(documentRecords);

      if (docsError) {
        console.error('Error creating document records:', docsError);
        // Don't fail the claim submission if document records fail
      }
    }

    // Create audit trail entry
    await supabase
      .from('claim_audit_trail')
      .insert({
        claim_id: claim.id,
        action: 'Claim Submitted',
        notes: `Member-submitted refund claim for ${benefit_type}`,
        performed_by: member_id,
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      claim_id: claim.id,
      claim_number: claimNumber,
      message: 'Claim submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting claim:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit claim',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
