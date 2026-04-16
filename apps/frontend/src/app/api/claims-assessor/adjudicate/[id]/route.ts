import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const claimId = params.id;

    const {
      action, // 'approve', 'reject', or 'pend'
      approved_amount,
      approval_notes,
      calculation_details,
      rejection_code,
      rejection_reason,
      pended_reason,
      additional_info_requested,
      assessor_id // TODO: Get from auth session
    } = body;

    // Validate action
    if (!['approve', 'reject', 'pend'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get current claim
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', claimId)
      .single();

    if (claimError || !claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Check if claim is already processed
    if (claim.status !== 'pending' && claim.status !== 'pended') {
      return NextResponse.json(
        { error: `Claim is already ${claim.status}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    let updateData: any = {
      updated_at: now
    };

    // Handle different actions
    if (action === 'approve') {
      // Validation
      if (!approved_amount || approved_amount <= 0) {
        return NextResponse.json(
          { error: 'Invalid approved amount' },
          { status: 400 }
        );
      }

      if (approved_amount > parseFloat(claim.claimed_amount)) {
        return NextResponse.json(
          { error: 'Approved amount cannot exceed claimed amount' },
          { status: 400 }
        );
      }

      updateData = {
        ...updateData,
        status: 'approved',
        approved_amount: approved_amount,
        approved_at: now,
        approved_by: assessor_id || null,
        // Store calculation details in claim_data
        claim_data: {
          ...claim.claim_data,
          approval_notes,
          calculation_details
        }
      };

      // Calculate processing time
      const submissionDate = new Date(claim.submission_date);
      const approvalDate = new Date(now);
      const processingTimeHours = (approvalDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60);
      updateData.processing_time_hours = processingTimeHours;

    } else if (action === 'reject') {
      // Validation
      if (!rejection_code || !rejection_reason) {
        return NextResponse.json(
          { error: 'Rejection code and reason are required' },
          { status: 400 }
        );
      }

      updateData = {
        ...updateData,
        status: 'rejected',
        rejection_code,
        rejection_reason,
        approved_amount: 0
      };

      // Calculate processing time
      const submissionDate = new Date(claim.submission_date);
      const rejectionDate = new Date(now);
      const processingTimeHours = (rejectionDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60);
      updateData.processing_time_hours = processingTimeHours;

    } else if (action === 'pend') {
      // Validation
      if (!pended_reason || !additional_info_requested) {
        return NextResponse.json(
          { error: 'Pend reason and additional info required are required' },
          { status: 400 }
        );
      }

      updateData = {
        ...updateData,
        status: 'pended',
        pended_reason,
        pended_date: now,
        additional_info_requested
      };
    }

    // Update claim
    const { data: updatedClaim, error: updateError } = await supabase
      .from('claims')
      .update(updateData)
      .eq('id', claimId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating claim:', updateError);
      throw updateError;
    }

    // Create audit trail entry
    const auditData = {
      claim_id: claimId,
      action: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pended',
      performed_by: assessor_id || null,
      previous_status: claim.status,
      new_status: updateData.status,
      notes: action === 'approve' 
        ? approval_notes 
        : action === 'reject' 
          ? rejection_reason 
          : additional_info_requested
    };

    const { error: auditError } = await supabase
      .from('claim_audit_trail')
      .insert(auditData);

    if (auditError) {
      console.error('Error creating audit trail:', auditError);
      // Don't fail the request if audit trail fails
    }

    // TODO: Send notifications
    // - Email/SMS to member
    // - Email to provider (if provider-submitted)
    // - Update benefit_usage table (if approved)

    return NextResponse.json({
      success: true,
      claim: updatedClaim,
      message: `Claim ${action}d successfully`
    });

  } catch (error) {
    console.error('Error adjudicating claim:', error);
    return NextResponse.json(
      { 
        error: 'Failed to adjudicate claim', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
