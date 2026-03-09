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
