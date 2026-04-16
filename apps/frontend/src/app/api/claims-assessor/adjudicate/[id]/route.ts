import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Update benefit usage when a claim is approved
 */
async function updateBenefitUsage(
  supabase: any,
  memberId: string,
  benefitType: string,
  approvedAmount: number
) {
  const currentYear = new Date().getFullYear();

  try {
    // Get or create benefit usage record
    const { data: existing, error: fetchError } = await supabase
      .from('benefit_usage')
      .select('*')
      .eq('member_id', memberId)
      .eq('benefit_type', benefitType)
      .eq('year', currentYear)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected if no record exists
      throw fetchError;
    }

    if (existing) {
      // Update existing record
      const newUsedAmount = (parseFloat(existing.used_amount) || 0) + approvedAmount;
      const newUsedCount = (existing.used_count || 0) + 1;

      const { error: updateError } = await supabase
        .from('benefit_usage')
        .update({
          used_amount: newUsedAmount,
          used_count: newUsedCount,
          last_claim_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        throw updateError;
      }

      console.log(`✅ Benefit usage updated for member ${memberId}, benefit ${benefitType}: +R${approvedAmount} (total: R${newUsedAmount}, count: ${newUsedCount})`);
    } else {
      // Create new record - get limits from product_benefits
      console.log(`⚠️  No benefit usage record found for member ${memberId}, benefit ${benefitType}. Creating new record.`);
      
      // Get member's plan_id
      const { data: member } = await supabase
        .from('members')
        .select('plan_id')
        .eq('id', memberId)
        .single();

      let totalLimitAmount = null;
      let totalLimitCount = null;

      if (member && member.plan_id) {
        // Get benefit limits from product_benefits
        const { data: benefit } = await supabase
          .from('product_benefits')
          .select('annual_limit, cover_amount, total_limit_count')
          .eq('product_id', member.plan_id)
          .eq('type', benefitType)
          .single();

        if (benefit) {
          totalLimitAmount = benefit.annual_limit || benefit.cover_amount;
          totalLimitCount = benefit.total_limit_count;
        }
      }

      const { error: insertError } = await supabase
        .from('benefit_usage')
        .insert({
          member_id: memberId,
          benefit_type: benefitType,
          year: currentYear,
          total_limit_amount: totalLimitAmount,
          total_limit_count: totalLimitCount,
          used_amount: approvedAmount,
          used_count: 1,
          last_claim_date: new Date().toISOString().split('T')[0],
        });

      if (insertError) {
        throw insertError;
      }

      console.log(`✅ Benefit usage record created for member ${memberId}, benefit ${benefitType}: R${approvedAmount}`);
    }
  } catch (error) {
    console.error('❌ Error updating benefit usage:', error);
    throw error;
  }
}

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

    // Update benefit usage if claim is approved
    if (action === 'approve' && claim.benefit_type && claim.member_id) {
      try {
        console.log(`🔄 Updating benefit usage for claim ${claimId}: member ${claim.member_id}, benefit ${claim.benefit_type}, amount R${approved_amount}`);
        
        await updateBenefitUsage(
          supabase,
          claim.member_id,
          claim.benefit_type,
          approved_amount
        );
        
        console.log(`✅ Benefit usage updated successfully for claim ${claimId}`);
      } catch (benefitError) {
        console.error('❌ Error updating benefit usage for claim', claimId, ':', benefitError);
        // Don't fail the request if benefit usage update fails
        // The claim is still approved, but usage tracking failed
        console.log('⚠️  Claim approved but benefit usage update failed. This should be investigated.');
      }
    } else if (action === 'approve') {
      console.log(`⚠️  Skipping benefit usage update for claim ${claimId}: benefit_type=${claim.benefit_type}, member_id=${claim.member_id}`);
    }

    // TODO: Send notifications
    // - Email/SMS to member
    // - Email to provider (if provider-submitted)

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
