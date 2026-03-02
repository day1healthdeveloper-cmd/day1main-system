import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Create fresh Supabase client to avoid caching
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false
        }
      }
    );
    
    // Fetch all policy section items for this product (no ordering to ensure all items are fetched)
    const { data: sectionItems, error } = await supabase
      .from('policy_section_items')
      .select('*')
      .eq('product_id', params.id);

    if (error) {
      console.error('Error fetching policy sections:', error);
      return NextResponse.json(
        { error: 'Failed to fetch policy sections' },
        { status: 500 }
      );
    }

    // Group items by section_type
    const sections: any = {};
    sectionItems?.forEach((item: any) => {
      if (!sections[item.section_type]) {
        sections[item.section_type] = [];
      }
      sections[item.section_type].push(item);
    });

    return NextResponse.json({
      sections,
      definitions: [],
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch policy sections' },
      { status: 500 }
    );
  }
}
