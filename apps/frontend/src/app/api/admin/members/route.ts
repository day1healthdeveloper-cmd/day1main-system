import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createServerSupabaseClient()
    
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const broker = searchParams.get('broker')
    const plan = searchParams.get('plan')
    const paymentMethod = searchParams.get('payment_method')
    const kycStatus = searchParams.get('kyc_status')
    const search = searchParams.get('search')
    
    // Build query with filters
    let query = supabaseAdmin
      .from('members')
      .select('*, brokers(code, name)', { count: 'exact' })
      .order('created_at', { ascending: false })
    
    // Apply all filters first
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (broker && broker !== 'all') {
      query = query.eq('broker_code', broker)
    }
    
    if (plan && plan !== 'all') {
      query = query.eq('plan_name', plan)
    }
    
    if (paymentMethod && paymentMethod !== 'all') {
      query = query.eq('payment_method', paymentMethod)
    }
    
    if (kycStatus && kycStatus !== 'all') {
      query = query.eq('kyc_status', kycStatus)
    }
    
    // Apply search AFTER filters (search within filtered results)
    if (search) {
      const cleanSearch = search.replace(/\s+/g, ''); // Remove spaces for ID number matching
      query = query.or(`member_number.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,id_number.ilike.%${cleanSearch}%,mobile.ilike.%${search}%`)
    }

    const { data: members, error, count } = await query

    if (error) throw error

    // Transform members to match the expected format
    const transformedMembers = (members || []).map(member => ({
      id: member.id,
      memberNumber: member.member_number,
      firstName: member.first_name,
      lastName: member.last_name,
      idNumber: member.id_number || 'N/A',
      email: member.email || 'N/A',
      phone: member.mobile || 'N/A',
      status: member.status,
      brokerCode: member.broker_code,
      brokerName: member.brokers?.name || 'N/A',
      policyNumber: member.member_number,
      product: member.plan_name || 'No Plan Assigned',
      planId: member.plan_id,
      paymentMethod: member.payment_method || 'N/A',
      monthlyPremium: member.monthly_premium || 0,
      joinDate: member.activated_at || member.created_at,
      kycStatus: member.status === 'active' ? 'verified' : 'pending',
      riskScore: 0,
    }))

    // Get all stats (unfiltered)
    const { count: totalCount } = await supabaseAdmin
      .from('members')
      .select('*', { count: 'exact', head: true })
    
    const { count: activeCount } = await supabaseAdmin
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    
    const { count: pendingCount } = await supabaseAdmin
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    const { count: suspendedCount } = await supabaseAdmin
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'suspended')

    const stats = {
      total: totalCount || 0,
      active: activeCount || 0,
      pending: pendingCount || 0,
      suspended: suspendedCount || 0,
      kycPending: pendingCount || 0,
    }

    // Get filter options
    const { data: brokers } = await supabaseAdmin
      .from('brokers')
      .select('code, name')
      .order('name')
    
    const { data: plans } = await supabaseAdmin
      .from('members')
      .select('plan_name')
      .not('plan_name', 'is', null)
    
    const uniquePlans = [...new Set(plans?.map(p => p.plan_name) || [])]

    return NextResponse.json({ 
      members: transformedMembers,
      stats,
      count: count || 0,
      filters: {
        brokers: brokers || [],
        plans: uniquePlans.sort(),
        paymentMethods: ['A - MAG TAPE', 'B - BANK CASH'],
        statuses: ['active', 'pending', 'suspended', 'in_waiting']
      }
    })
  } catch (error) {
    console.error('Failed to fetch members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
