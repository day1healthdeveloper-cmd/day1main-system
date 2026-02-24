import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: failedPayments, error } = await supabase
      .from('debit_orders')
      .select(`
        *,
        members (
          id,
          first_name,
          last_name,
          id_number,
          phone,
          email
        ),
        debit_order_batches (
          id,
          batch_number,
          action_date
        )
      `)
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({ failedPayments: failedPayments || [] })
  } catch (error) {
    console.error('Error fetching failed payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch failed payments' },
      { status: 500 }
    )
  }
}
