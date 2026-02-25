import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { data: broker, error } = await supabase
      .from('brokers')
      .update({
        name: body.name,
        broker_commission_rate: parseFloat(body.broker_commission_rate),
        branch_commission_rate: parseFloat(body.branch_commission_rate),
        agent_commission_rate: parseFloat(body.agent_commission_rate),
        policy_prefix: body.policy_prefix,
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ broker })
  } catch (error: any) {
    console.error('Error updating broker:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update broker' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if broker has members
    const { count } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('broker_id', params.id)

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Cannot delete broker with ${count} active members. Please reassign members first.` },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('brokers')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting broker:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete broker' },
      { status: 500 }
    )
  }
}
