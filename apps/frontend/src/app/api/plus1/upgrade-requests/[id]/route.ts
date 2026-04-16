import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, verification_notes, call_recording_url, rejection_reason } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Handle different actions
    if (action === 'verify') {
      // Verify the upgrade request
      if (!verification_notes) {
        return NextResponse.json(
          { error: 'Verification notes are required' },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from('plus1_upgrade_requests')
        .update({
          status: 'verified',
          verification_notes,
          call_recording_url: call_recording_url || null,
          verified_at: new Date().toISOString(),
          // TODO: Add verified_by from authenticated user
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error verifying upgrade request:', error);
        return NextResponse.json(
          { error: 'Failed to verify upgrade request' },
          { status: 500 }
        );
      }

      console.log(`✅ Upgrade request verified: ${id}`);
      return NextResponse.json({ success: true, upgradeRequest: data });
    }

    if (action === 'reject') {
      // Reject the upgrade request
      if (!rejection_reason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from('plus1_upgrade_requests')
        .update({
          status: 'rejected',
          rejection_reason,
          rejected_at: new Date().toISOString(),
          // TODO: Add rejected_by from authenticated user
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error rejecting upgrade request:', error);
        return NextResponse.json(
          { error: 'Failed to reject upgrade request' },
          { status: 500 }
        );
      }

      console.log(`❌ Upgrade request rejected: ${id}`);
      return NextResponse.json({ success: true, upgradeRequest: data });
    }

    if (action === 'approve') {
      // Approve the upgrade request (operations manager)
      
      // 1. Get the upgrade request details
      const { data: upgradeRequest, error: fetchError } = await supabaseAdmin
        .from('plus1_upgrade_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !upgradeRequest) {
        console.error('Error fetching upgrade request:', fetchError);
        return NextResponse.json(
          { error: 'Upgrade request not found' },
          { status: 404 }
        );
      }

      // 2. Get member details from Day1Main database
      const { data: member, error: memberError } = await supabaseAdmin
        .from('members')
        .select('*')
        .eq('mobile', upgradeRequest.mobile_number)
        .single();

      if (memberError || !member) {
        console.error('Error fetching member:', memberError);
        return NextResponse.json(
          { error: 'Member not found in Day1Main database' },
          { status: 404 }
        );
      }

      // 3. Update Plus1Rewards database FIRST (to prevent duplicates if this fails)
      console.log(`🔄 Updating Plus1 member plan for mobile: ${upgradeRequest.mobile_number}`);
      
      const plus1UpdateResponse = await fetch(
        `${process.env.PLUS1_SUPABASE_URL}/rest/v1/members?cell_phone=eq.${encodeURIComponent(upgradeRequest.mobile_number)}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY!,
            'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY!}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            cover_plan_name: upgradeRequest.upgraded_plan,
            cover_plan_price: upgradeRequest.upgraded_price?.toString() || '0',
            plan_status: 'active'
          })
        }
      );

      if (!plus1UpdateResponse.ok) {
        const errorText = await plus1UpdateResponse.text();
        console.error('❌ Failed to update Plus1 database:', errorText);
        return NextResponse.json(
          { error: 'Failed to update Plus1Rewards database. Upgrade not approved.' },
          { status: 500 }
        );
      }

      const plus1UpdateData = await plus1UpdateResponse.json();
      console.log(`✅ Plus1 member plan updated for mobile: ${upgradeRequest.mobile_number} (${plus1UpdateData.length} row(s) updated)`);

      // 4. Update member record in Day1Main database
      const { error: updateError } = await supabaseAdmin
        .from('members')
        .update({
          plan_name: upgradeRequest.upgraded_plan,
          monthly_premium: upgradeRequest.upgraded_price,
          updated_at: new Date().toISOString(),
        })
        .eq('id', member.id);

      if (updateError) {
        console.error('❌ Error updating Day1Main member record:', updateError);
        // Note: Plus1 was already updated, so log this as critical
        console.error('⚠️ CRITICAL: Plus1 updated but Day1Main failed. Manual intervention needed for member:', member.member_number);
        return NextResponse.json(
          { error: 'Failed to update member record in Day1Main' },
          { status: 500 }
        );
      }

      console.log(`✅ Day1Main member updated: ${member.member_number}`);

      // 5. Update upgrade request status to 'approved'
      const { data: approvedRequest, error: approvalError } = await supabaseAdmin
        .from('plus1_upgrade_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          // TODO: Add approved_by from authenticated user
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (approvalError) {
        console.error('Error updating upgrade request status:', approvalError);
        return NextResponse.json(
          { error: 'Failed to update upgrade request status' },
          { status: 500 }
        );
      }

      // 6. TODO: Send confirmation email/SMS to member
      console.log(`✅ Upgrade approved for member: ${member.member_number}`);
      console.log(`   From: ${upgradeRequest.current_plan} (R${upgradeRequest.current_price})`);
      console.log(`   To: ${upgradeRequest.upgraded_plan} (R${upgradeRequest.upgraded_price})`);

      return NextResponse.json({ 
        success: true, 
        upgradeRequest: approvedRequest,
        message: 'Upgrade approved successfully. Member plan updated in both databases.'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing upgrade request update:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
