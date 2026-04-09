import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = createServerSupabaseClient()

    // Fetch member with broker details
    const { data: member, error } = await supabaseAdmin
      .from('members')
      .select('*, brokers(code, name)')
      .eq('id', params.id)
      .single()

    if (error) throw error

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Fetch dependents count
    const { count: dependentsCount } = await supabaseAdmin
      .from('member_dependents')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', params.id)
      .eq('status', 'active')

    // Fetch dependents details
    const { data: dependents } = await supabaseAdmin
      .from('member_dependents')
      .select('*')
      .eq('member_id', params.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })

    // Transform to match expected format
    const transformedMember = {
      id: member.id,
      memberNumber: member.member_number,
      firstName: member.first_name,
      lastName: member.last_name,
      idNumber: member.id_number,
      email: member.email,
      phone: member.mobile,
      mobile: member.mobile,
      status: member.status,
      brokerCode: member.broker_code,
      brokerName: member.brokers?.name || 'N/A',
      policyNumber: member.member_number, // Policy number = Member number
      product: member.plan_name,
      planId: member.plan_id,
      planStartDate: member.plan_start_date,
      paymentMethod: member.payment_method,
      monthlyPremium: member.monthly_premium || 0,
      joinDate: member.approved_at || member.created_at, // Use approved_at or created_at
      kycStatus: member.kyc_status || 'pending',
      riskScore: member.risk_score || 0,
      
      // Address Information
      addressLine1: member.address_line1,
      addressLine2: member.address_line2,
      city: member.city,
      postalCode: member.postal_code,
      
      // Personal Details
      dateOfBirth: member.date_of_birth,
      gender: member.gender,
      
      // Banking Details
      bankName: member.bank_name,
      accountNumber: member.account_number,
      branchCode: member.branch_code,
      debitOrderDay: member.debit_order_day,
      
      // Status & Lifecycle
      suspensionReason: member.suspension_reason,
      suspensionDate: member.suspension_date,
      cancellationDate: member.cancellation_date,
      cancellationReason: member.cancellation_reason,
      activatedAt: member.activated_at,
      
      // Waiting Periods
      waitingPeriodEndDate: member.waiting_period_end_date,
      pmbWaitingPeriodEndDate: member.pmb_waiting_period_end_date,
      
      // Timestamps
      createdAt: member.created_at,
      updatedAt: member.updated_at,
      
      // Application Reference
      applicationId: member.application_id,
      
      // Dependents
      dependentsCount: dependentsCount || 0,
      dependents: dependents || [],
    }

    return NextResponse.json(transformedMember)
  } catch (error) {
    console.error('Failed to fetch member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member details' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = createServerSupabaseClient()
    const body = await request.json()
    const { planId } = body

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Get plan name from products table
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('name')
      .eq('id', planId)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Update member
    const { data: member, error } = await supabaseAdmin
      .from('members')
      .update({
        plan_id: planId,
        plan_name: product.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      member 
    })
  } catch (error) {
    console.error('Failed to update member:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = createServerSupabaseClient()

    // First, check if member exists
    const { data: member, error: fetchError } = await supabaseAdmin
      .from('members')
      .select('member_number, first_name, last_name')
      .eq('id', params.id)
      .single()

    if (fetchError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Get all claim IDs for this member (needed to delete claim-related records)
    const { data: claims } = await supabaseAdmin
      .from('claims')
      .select('id')
      .eq('member_id', params.id)

    const claimIds = claims?.map(c => c.id) || []

    // Delete in correct order (child tables first, then parent tables)
    // This ensures referential integrity is maintained during deletion
    
    // 1. Delete claim documents (references claims)
    if (claimIds.length > 0) {
      await supabaseAdmin
        .from('claim_documents')
        .delete()
        .in('claim_id', claimIds)
    }

    // 2. Delete claim audit trail (references claims)
    if (claimIds.length > 0) {
      await supabaseAdmin
        .from('claim_audit_trail')
        .delete()
        .in('claim_id', claimIds)
    }

    // 3. Delete claims (references members)
    await supabaseAdmin
      .from('claims')
      .delete()
      .eq('member_id', params.id)

    // 4. Delete payment history (references members)
    await supabaseAdmin
      .from('payment_history')
      .delete()
      .eq('member_id', params.id)

    // 5. Delete payment discrepancies (references members)
    await supabaseAdmin
      .from('payment_discrepancies')
      .delete()
      .eq('member_id', params.id)

    // 6. Delete refund requests (references members)
    await supabaseAdmin
      .from('refund_requests')
      .delete()
      .eq('member_id', params.id)

    // 7. Delete EFT payment notifications (references members)
    await supabaseAdmin
      .from('eft_payment_notifications')
      .delete()
      .eq('member_id', params.id)

    // 8. Delete group member payments (references members)
    await supabaseAdmin
      .from('group_member_payments')
      .delete()
      .eq('member_id', params.id)

    // 9. Delete member dependants (references members)
    await supabaseAdmin
      .from('member_dependants')
      .delete()
      .eq('member_id', params.id)

    // 10. Finally, delete the member
    const { error: deleteError } = await supabaseAdmin
      .from('members')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Failed to delete member:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete member', details: deleteError.message },
        { status: 500 }
      )
    }

    // Note: contacts table is NOT deleted - contact information is preserved
    
    return NextResponse.json({ 
      success: true,
      message: `Member ${member.first_name} ${member.last_name} (${member.member_number}) and all related records have been permanently deleted`
    })
  } catch (error) {
    console.error('Failed to delete member:', error)
    return NextResponse.json(
      { error: 'Failed to delete member', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
