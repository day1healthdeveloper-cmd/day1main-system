import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/lib/auth-server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAnyRole(request, ['claims', 'admin', 'system_admin']);

    const { id } = params;
    const body = await request.json();
    const { action, notes, fraud_review_status } = body;

    // Fetch current claim
    const { data: currentClaim, error: fetchError } = await supabaseAdmin
      .from('claims')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentClaim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    const previousStatus = currentClaim.status;
    let updateData: any = {
      updated_at: new Date().toISOString(),
      fraud_review_notes: notes
    };

    let auditAction = '';
    let newStatus = previousStatus;

    // Handle fraud review actions
    switch (action) {
      case 'clear':
        updateData.fraud_alert_triggered = false;
        updateData.fraud_review_status = 'cleared';
        updateData.status = 'pending'; // Return to normal queue
        auditAction = 'fraud_cleared';
        newStatus = 'pending';
        break;

      case 'confirm':
        updateData.fraud_review_status = 'confirmed';
        updateData.status = 'rejected';
        updateData.rejection_reason = 'Fraud confirmed: ' + (notes || 'Fraudulent activity detected');
        auditAction = 'fraud_confirmed';
        newStatus = 'rejected';
        
        // Update provider fraud risk score
        if (currentClaim.provider_id) {
          await supabaseAdmin
            .from('providers')
            .update({
              fraud_risk_score: supabaseAdmin.rpc('increment', { 
                row_id: currentClaim.provider_id,
                increment_by: 10 
              })
            })
            .eq('id', currentClaim.provider_id);
        }
        break;

      case 'investigate':
        updateData.fraud_review_status = 'investigating';
        updateData.status = 'pended';
        updateData.pended_reason = 'Under fraud investigation';
        updateData.pended_date = new Date().toISOString();
        auditAction = 'fraud_investigating';
        newStatus = 'pended';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update claim
    const { data: updatedClaim, error: updateError } = await supabaseAdmin
      .from('claims')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating claim:', updateError);
      return NextResponse.json(
        { error: 'Failed to update claim', details: updateError.message },
        { status: 500 }
      );
    }

    // Create audit trail entry
    await supabaseAdmin
      .from('claim_audit_trail')
      .insert({
        claim_id: id,
        action: auditAction,
        previous_status: previousStatus,
        new_status: newStatus,
        notes: notes || `Fraud case ${action}`,
      });

    return NextResponse.json({
      success: true,
      claim: updatedClaim,
      message: `Fraud case ${action}ed successfully`
    });

  } catch (error: any) {
    console.error('Error in fraud PATCH API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
