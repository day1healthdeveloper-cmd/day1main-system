import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    console.log('Fetching brokers...')
    
    // Fetch all brokers
    const { data: brokers, error } = await supabase
      .from('brokers')
      .select('*')
      .order('code', { ascending: true })

    if (error) {
      console.error('Brokers query error:', error)
      throw error
    }

    console.log('Brokers fetched:', brokers?.length)

    // For each broker, count actual members from members table
    const brokersWithCounts = await Promise.all(
      (brokers || []).map(async (broker) => {
        const { count } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('broker_id', broker.id)
          .eq('status', 'active')

        return {
          ...broker,
          member_count: count || 0,
        }
      })
    )

    console.log('Returning brokers with counts:', brokersWithCounts.length)
    return NextResponse.json({ brokers: brokersWithCounts })
  } catch (error) {
    console.error('Error fetching brokers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brokers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { data: broker, error } = await supabase
      .from('brokers')
      .insert({
        code: body.code,
        name: body.name,
        broker_commission_rate: parseFloat(body.broker_commission_rate),
        branch_commission_rate: parseFloat(body.branch_commission_rate),
        agent_commission_rate: parseFloat(body.agent_commission_rate),
        policy_prefix: body.policy_prefix,
        status: body.status,
        member_count: 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ broker })
  } catch (error: any) {
    console.error('Error adding broker:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add broker' },
      { status: 500 }
    )
  }
}
