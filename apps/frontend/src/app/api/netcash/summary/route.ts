import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Fetch all active members with their payment groups
    const { data: members, error } = await supabase
      .from('members')
      .select(`
        *,
        payment_groups (
          id,
          name,
          broker_name
        )
      `)
      .eq('status', 'active')
      .not('payment_group_id', 'is', null)

    if (error) throw error

    // Calculate summary by broker
    const byBroker: Record<string, { count: number; premium: number }> = {}
    let totalMembers = 0
    let totalPremium = 0

    members?.forEach((member: any) => {
      const brokerName = member.payment_groups?.broker_name || 'Unknown Broker'
      const premium = parseFloat(member.premium || 0)

      if (!byBroker[brokerName]) {
        byBroker[brokerName] = { count: 0, premium: 0 }
      }

      byBroker[brokerName].count++
      byBroker[brokerName].premium += premium
      totalMembers++
      totalPremium += premium
    })

    return NextResponse.json({
      totalMembers,
      totalPremium,
      byBroker,
    })
  } catch (error) {
    console.error('Error fetching netcash summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    )
  }
}
