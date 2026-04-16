import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabaseAdmin = createServerSupabaseClient()
    
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('status', 'published')
      .order('name')

    if (error) throw error

    return NextResponse.json({ 
      products: products || []
    })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
