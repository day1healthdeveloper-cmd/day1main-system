import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: batches, error } = await supabase
      .from('debit_order_batches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ batches: batches || [] })
  } catch (error) {
    console.error('Error fetching batches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    )
  }
}
