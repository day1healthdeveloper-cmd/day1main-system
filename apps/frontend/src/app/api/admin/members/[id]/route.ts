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

    // Transform to match expected format
    const transformedMember = {
      id: member.id,
      memberNumber: member.member_number,
      firstName: member.first_name,
      lastName: member.last_name,
      idNumber: member.id_number,
      email: member.email,
      phone: member.phone,
      status: member.status,
      brokerCode: member.broker_code,
      brokerName: member.brokers?.name || 'N/A',
      policyNumber: member.policy_number,
      product: member.plan_name,
      planId: member.plan_id,
      paymentMethod: member.payment_method,
      monthlyPremium: member.monthly_premium || 0,
      joinDate: member.join_date,
      kycStatus: member.kyc_status || 'pending',
      riskScore: member.risk_score || 0,
      addressLine1: member.address_line1,
      addressLine2: member.address_line2,
      city: member.city,
      postalCode: member.postal_code,
      dateOfBirth: member.date_of_birth,
      gender: member.gender,
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
