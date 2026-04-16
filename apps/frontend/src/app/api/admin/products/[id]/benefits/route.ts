import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = createServerSupabaseClient()
    
    const { data: benefits, error } = await supabaseAdmin
      .from('product_benefits')
      .select('*')
      .eq('product_id', params.id)
      .order('name')

    if (error) throw error

    return NextResponse.json({ 
      benefits: benefits || []
    })
  } catch (error) {
    console.error('Failed to fetch product benefits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product benefits' },
      { status: 500 }
    )
  }
}
