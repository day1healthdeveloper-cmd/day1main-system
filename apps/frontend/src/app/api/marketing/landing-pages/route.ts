import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: pages, error } = await supabase
      .from('landing_pages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(pages || [])
  } catch (error) {
    console.error('Error fetching landing pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch landing pages' },
      { status: 500 }
    )
  }
}
