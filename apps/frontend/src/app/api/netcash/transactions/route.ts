import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId')
    const status = searchParams.get('status')

    let query = supabase
      .from('debit_orders')
      .select(`
        *,
        members (
          id,
          first_name,
          last_name,
          id_number
        ),
        debit_order_batches (
          id,
          batch_number,
          action_date
        )
      `)
      .order('created_at', { ascending: false })

    if (batchId) {
      query = query.eq('batch_id', batchId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: transactions, error } = await query.limit(100)

    if (error) throw error

    return NextResponse.json({ transactions: transactions || [] })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
