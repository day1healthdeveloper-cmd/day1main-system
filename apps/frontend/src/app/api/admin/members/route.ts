import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createServerSupabaseClient()
    
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const statsOnly = searchParams.get('stats_only') === 'true'
    const filtersOnly = searchParams.get('filters_only') === 'true'
    const includeDependants = searchParams.get('include_dependants') === 'true'
    const status = searchParams.get('status')
    const broker = searchParams.get('broker')
    const plan = searchParams.get('plan')
    const paymentMethod = searchParams.get('payment_method')
    const kycStatus = searchParams.get('kyc_status')
    const search = searchParams.get('search')
    
    // If only filters are requested, return them quickly
    if (filtersOnly) {
      const { data: brokers } = await supabaseAdmin
        .from('brokers')
        .select('code, name')
        .order('name')
      
      // Get ALL unique plan names using a more efficient query
      const { data: plans, error: plansError } = await supabaseAdmin
        .rpc('get_unique_plan_names')
      
      const uniquePlans = plans?.map((p: any) => p.plan_name) || []

      return NextResponse.json({ 
        filters: {
          brokers: brokers || [],
          plans: uniquePlans,
          paymentMethods: ['A - MAG TAPE', 'B - BANK CASH'],
          statuses: ['active', 'pending', 'suspended', 'in_waiting']
        }
      })
    }
    
    // If only stats are requested, return them quickly
    if (statsOnly) {
      const { count: totalMembersCount } = await supabaseAdmin
        .from('members')
        .select('*', { count: 'exact', head: true })
      
      const { count: totalDependantsCount } = await supabaseAdmin
        .from('member_dependants')
        .select('*', { count: 'exact', head: true })
      
      const { count: activeMembersCount } = await supabaseAdmin
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
      
      const { count: activeDependantsCount } = await supabaseAdmin
        .from('member_dependants')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
      
      const { count: pendingCount } = await supabaseAdmin
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      
      const { count: suspendedMembersCount } = await supabaseAdmin
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'suspended')
      
      const { count: suspendedDependantsCount } = await supabaseAdmin
        .from('member_dependants')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'suspended')

      const stats = {
        total: (totalMembersCount || 0) + (totalDependantsCount || 0),
        active: (activeMembersCount || 0) + (activeDependantsCount || 0),
        pending: pendingCount || 0,
        suspended: (suspendedMembersCount || 0) + (suspendedDependantsCount || 0),
        kycPending: pendingCount || 0,
      }

      return NextResponse.json({ stats })
    }
    
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
      const searchTerms = search.trim().split(/\s+/); // Split by whitespace
      
      if (searchTerms.length === 1) {
        // Single term: search in all fields
        query = query.or(`member_number.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,id_number.ilike.%${cleanSearch}%,mobile.ilike.%${search}%`)
      } else {
        // Multiple terms: search each term in first_name OR last_name
        const orConditions = searchTerms.map(term => 
          `first_name.ilike.%${term}%,last_name.ilike.%${term}%`
        ).join(',');
        query = query.or(orConditions);
      }
    }

    const { data: members, error, count } = await query

    if (error) throw error

    // If searching and no members found, search dependants and get their main members
    let additionalMembers: any[] = [];
    if (search && (!members || members.length === 0)) {
      const searchTerms = search.trim().split(/\s+/);
      let dependantsQuery = supabaseAdmin.from('member_dependants').select('member_number, first_name, last_name');
      
      if (searchTerms.length === 1) {
        dependantsQuery = dependantsQuery.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      } else {
        const orConditions = searchTerms.map(term => 
          `first_name.ilike.%${term}%,last_name.ilike.%${term}%`
        ).join(',');
        dependantsQuery = dependantsQuery.or(orConditions);
      }
      
      const { data: dependants } = await dependantsQuery.limit(10);
      
      if (dependants && dependants.length > 0) {
        const memberNumbers = [...new Set(dependants.map(d => d.member_number))];
        const { data: mainMembers } = await supabaseAdmin
          .from('members')
          .select('*, brokers(code, name)')
          .in('member_number', memberNumbers);
        
        if (mainMembers) {
          additionalMembers = mainMembers;
        }
      }
    }

    const allMembers = [...(members || []), ...additionalMembers];

    // Transform members and fetch dependants if requested
    const transformedMembers = await Promise.all((allMembers || []).map(async (member) => {
      const transformedMember: any = {
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
        joinDate: member.start_date || member.activated_at || member.created_at,
        kycStatus: member.status === 'active' ? 'verified' : 'pending',
        riskScore: 0,
        dependants: []
      }

      // Fetch dependants if requested
      if (includeDependants) {
        const { data: dependants } = await supabaseAdmin
          .from('member_dependants')
          .select('*')
          .eq('member_number', member.member_number)
          .order('dependant_code')

        if (dependants && dependants.length > 0) {
          transformedMember.dependants = dependants.map((dep: any) => ({
            id: dep.id,
            memberNumber: dep.member_number,
            firstName: dep.first_name,
            lastName: dep.last_name,
            idNumber: dep.id_number || 'N/A',
            email: 'N/A',
            phone: 'N/A',
            status: dep.status,
            brokerCode: member.broker_code,
            brokerName: member.brokers?.name || 'N/A',
            policyNumber: dep.member_number,
            product: member.plan_name || 'No Plan Assigned',
            planId: member.plan_id,
            paymentMethod: 'N/A',
            monthlyPremium: 0,
            joinDate: dep.created_at,
            kycStatus: dep.status === 'active' ? 'verified' : 'pending',
            riskScore: 0,
            isDependant: true,
            dependantType: dep.dependant_type,
            dependantCode: dep.dependant_code
          }))
        }
      }

      return transformedMember
    }))

    // Get all stats (unfiltered) - include dependants
    const { count: totalMembersCount } = await supabaseAdmin
      .from('members')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalDependantsCount } = await supabaseAdmin
      .from('member_dependants')
      .select('*', { count: 'exact', head: true })
    
    const { count: activeMembersCount } = await supabaseAdmin
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    
    const { count: activeDependantsCount } = await supabaseAdmin
      .from('member_dependants')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    
    const { count: pendingCount } = await supabaseAdmin
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    const { count: suspendedMembersCount } = await supabaseAdmin
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'suspended')
    
    const { count: suspendedDependantsCount } = await supabaseAdmin
      .from('member_dependants')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'suspended')

    const stats = {
      total: (totalMembersCount || 0) + (totalDependantsCount || 0),
      active: (activeMembersCount || 0) + (activeDependantsCount || 0),
      pending: pendingCount || 0,
      suspended: (suspendedMembersCount || 0) + (suspendedDependantsCount || 0),
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
      count: transformedMembers.length,
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

