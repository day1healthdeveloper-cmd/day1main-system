import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { actionDate, instruction, brokerGroups } = body

    // Fetch members for the batch
    let query = supabase
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

    const { data: members, error: membersError } = await query

    if (membersError) throw membersError

    // Filter by broker groups if specified
    let filteredMembers = members || []
    if (brokerGroups && brokerGroups.length > 0) {
      filteredMembers = filteredMembers.filter((m: any) =>
        brokerGroups.includes(m.payment_groups?.broker_name)
      )
    }

    // Create debit order batch record
    const { data: batch, error: batchError } = await supabase
      .from('debit_order_batches')
      .insert({
        action_date: actionDate,
        instruction_type: instruction,
        total_members: filteredMembers.length,
        total_amount: filteredMembers.reduce((sum: number, m: any) => sum + parseFloat(m.premium || 0), 0),
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (batchError) throw batchError

    // Create individual debit order records
    const debitOrders = filteredMembers.map((member: any) => ({
      batch_id: batch.id,
      member_id: member.id,
      amount: parseFloat(member.premium || 0),
      account_holder: `${member.first_name} ${member.last_name}`,
      account_number: member.bank_account_number,
      bank_name: member.bank_name,
      branch_code: member.bank_branch_code,
      account_type: member.bank_account_type || 'current',
      status: 'pending',
    }))

    const { error: ordersError } = await supabase
      .from('debit_orders')
      .insert(debitOrders)

    if (ordersError) throw ordersError

    return NextResponse.json({
      success: true,
      runId: batch.id,
      batchNumber: batch.batch_number,
      totalMembers: filteredMembers.length,
      totalAmount: batch.total_amount,
    })
  } catch (error) {
    console.error('Error generating batch:', error)
    return NextResponse.json(
      { error: 'Failed to generate batch', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
