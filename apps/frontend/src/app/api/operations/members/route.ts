import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAuthenticatedSupabaseClient, requireAnyRole } from '@/lib/auth-server'
import { buildBrokerMemberFilter, resolveBrokerIdentity, type BrokerRecord } from '@/lib/broker-identity'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function GET(request: NextRequest) {
  try {
    await requireAnyRole(request, ['operations_manager', 'system_admin', 'admin', 'finance_manager'])
    const supabase = createAuthenticatedSupabaseClient(request)
    const { data: brokers } = await supabase
      .from('brokers')
      .select('code, name, policy_prefix')
      .order('name')
    const brokerRecords = (brokers || []) as BrokerRecord[]

    const searchParams = request.nextUrl.searchParams
    const statsOnly = searchParams.get('stats_only') === 'true'
    const filtersOnly = searchParams.get('filters_only') === 'true'
    const includeDependants = searchParams.get('include_dependants') === 'true'
    const status = searchParams.get('status')
    const broker = searchParams.get('broker')
    const plan = searchParams.get('plan')
    const paymentMethod = searchParams.get('payment_method')
    const search = searchParams.get('search')
    const page = Math.max(1, Number(searchParams.get('page') || '1'))
    const pageSize = Math.max(1, Math.min(100, Number(searchParams.get('page_size') || '25')))
    const shouldPaginate = !search && (!status || status === 'all') && (!broker || broker === 'all') && (!plan || plan === 'all') && (!paymentMethod || paymentMethod === 'all')

    if (filtersOnly) {
      const { data: plans } = await supabase
        .from('members')
        .select('plan_name')
        .not('plan_name', 'is', null)

      const uniquePlans = [...new Set((plans || []).map((p) => p.plan_name))]

      return NextResponse.json({
        filters: {
          brokers: brokerRecords,
          plans: uniquePlans.sort(),
          paymentMethods: ['A - MAG TAPE', 'B - BANK CASH'],
          statuses: ['active', 'pending', 'suspended', 'in_waiting'],
        },
      })
    }

    if (statsOnly) {
      const { count: totalMembersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })

      const { count: totalDependantsCount } = await supabase
        .from('member_dependants')
        .select('*', { count: 'exact', head: true })

      const { count: activeMembersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { count: activeDependantsCount } = await supabase
        .from('member_dependants')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { count: pendingCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      const { count: suspendedMembersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'suspended')

      const { count: suspendedDependantsCount } = await supabase
        .from('member_dependants')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'suspended')

      return NextResponse.json({
        stats: {
          total: (totalMembersCount || 0) + (totalDependantsCount || 0),
          active: (activeMembersCount || 0) + (activeDependantsCount || 0),
          pending: pendingCount || 0,
          suspended: (suspendedMembersCount || 0) + (suspendedDependantsCount || 0),
        },
      })
    }

    let query = supabase
      .from('members')
      .select('*, brokers(code, name)', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (broker && broker !== 'all') {
      query = query.or(buildBrokerMemberFilter(broker))
    }

    if (plan && plan !== 'all') {
      query = query.eq('plan_name', plan)
    }

    if (paymentMethod && paymentMethod !== 'all') {
      query = query.eq('payment_method', paymentMethod)
    }

    if (search) {
      const cleanSearch = search.replace(/\s+/g, '')
      const searchTerms = search.trim().split(/\s+/)

      if (searchTerms.length === 1) {
        query = query.or(
          `member_number.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,id_number.ilike.%${cleanSearch}%,mobile.ilike.%${search}%`
        )
      } else {
        const orConditions = searchTerms
          .map((term) => `first_name.ilike.%${term}%,last_name.ilike.%${term}%`)
          .join(',')
        query = query.or(orConditions)
      }
    }

    if (shouldPaginate) {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)
    }

    const { data: members, error, count } = await query
    if (error) throw error

    let additionalMembers: any[] = []
    if (search && (!members || members.length === 0)) {
      const searchTerms = search.trim().split(/\s+/)
      let dependantsQuery = supabase.from('member_dependants').select('member_number, first_name, last_name')

      if (searchTerms.length === 1) {
        dependantsQuery = dependantsQuery.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
      } else {
        const orConditions = searchTerms
          .map((term) => `first_name.ilike.%${term}%,last_name.ilike.%${term}%`)
          .join(',')
        dependantsQuery = dependantsQuery.or(orConditions)
      }

      const { data: dependants } = await dependantsQuery.limit(10)

      if (dependants && dependants.length > 0) {
        const memberNumbers = [...new Set(dependants.map((d) => d.member_number))]
        const { data: mainMembers } = await supabase
          .from('members')
          .select('*, brokers(code, name)')
          .in('member_number', memberNumbers)

        if (mainMembers) {
          additionalMembers = mainMembers
        }
      }
    }

    const allMembers = [...(members || []), ...additionalMembers]

    const transformedMembers = await Promise.all(
      allMembers.map(async (member) => {
        const brokerIdentity = resolveBrokerIdentity(
          member.member_number,
          member.broker_code,
          Array.isArray(member.brokers) ? member.brokers[0]?.name : member.brokers?.name,
          brokerRecords
        )

        const transformedMember: any = {
          id: member.id,
          memberNumber: member.member_number,
          firstName: member.first_name,
          lastName: member.last_name,
          idNumber: member.id_number || 'N/A',
          email: member.email || 'N/A',
          phone: member.mobile || 'N/A',
          status: member.status,
          brokerCode: brokerIdentity.code,
          brokerName: brokerIdentity.name,
          policyNumber: member.member_number,
          product: member.plan_name || 'No Plan Assigned',
          planId: member.plan_id,
          paymentMethod: member.payment_method || 'N/A',
          monthlyPremium: member.monthly_premium || 0,
          joinDate: member.start_date || member.activated_at || member.created_at,
          riskScore: 0,
          dependants: [],
        }

        if (includeDependants) {
          const { data: dependants } = await supabase
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
              brokerCode: brokerIdentity.code,
              brokerName: brokerIdentity.name,
              policyNumber: dep.member_number,
              product: member.plan_name || 'No Plan Assigned',
              planId: member.plan_id,
              paymentMethod: 'N/A',
              monthlyPremium: 0,
              joinDate: dep.created_at,
              riskScore: 0,
              isDependant: true,
              dependantType: dep.dependant_type,
              dependantCode: dep.dependant_code,
            }))
          }
        }

        return transformedMember
      })
    )

    const { count: totalMembersCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })

    const { count: totalDependantsCount } = await supabase
      .from('member_dependants')
      .select('*', { count: 'exact', head: true })

    const { count: activeMembersCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { count: activeDependantsCount } = await supabase
      .from('member_dependants')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { count: pendingCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { count: suspendedMembersCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'suspended')

    const { count: suspendedDependantsCount } = await supabase
      .from('member_dependants')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'suspended')

    const { data: plans } = await supabase
      .from('members')
      .select('plan_name')
      .not('plan_name', 'is', null)

    const uniquePlans = [...new Set(plans?.map((p) => p.plan_name) || [])]

    return NextResponse.json({
      members: transformedMembers,
      stats: {
        total: (totalMembersCount || 0) + (totalDependantsCount || 0),
        active: (activeMembersCount || 0) + (activeDependantsCount || 0),
        pending: pendingCount || 0,
        suspended: (suspendedMembersCount || 0) + (suspendedDependantsCount || 0),
      },
      count: count ?? transformedMembers.length,
      pagination: {
        page,
        pageSize,
        hasMore: shouldPaginate ? (count ?? 0) > page * pageSize : false,
      },
      filters: {
        brokers: brokerRecords,
        plans: uniquePlans.sort(),
        paymentMethods: ['A - MAG TAPE', 'B - BANK CASH'],
        statuses: ['active', 'pending', 'suspended', 'in_waiting'],
      },
    })
  } catch (error) {
    console.error('Failed to fetch operations members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch operations members', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAnyRole(request, ['operations_manager', 'system_admin', 'admin'])

    const body = await request.json()
    const { data: member, error } = await supabaseAdmin
      .from('members')
      .insert({
        member_number: body.member_number,
        first_name: body.first_name,
        last_name: body.last_name,
        id_number: body.id_number,
        date_of_birth: body.commence_date,
        monthly_premium: body.monthly_premium,
        phone: body.phone || null,
        email: body.email || null,
        payment_group_id: body.payment_group_id,
        collection_method: body.collection_method,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating member:', error)
      return NextResponse.json(
        {
          error: 'Failed to create member',
          details: error.message,
          hint: error.hint,
          code: error.code,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error in POST /api/operations/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
