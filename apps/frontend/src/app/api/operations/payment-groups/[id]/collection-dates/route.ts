import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('payment_groups')
      .select('collection_dates')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ collection_dates: data.collection_dates || [] });
  } catch (error) {
    console.error('Error fetching collection dates:', error);
    return NextResponse.json({ error: 'Failed to fetch collection dates' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { collection_dates } = body;

    // Validate that we have exactly 12 dates (can be empty strings)
    if (!Array.isArray(collection_dates) || collection_dates.length !== 12) {
      return NextResponse.json(
        { error: 'Must provide exactly 12 collection dates (one per month)' },
        { status: 400 }
      );
    }

    // Validate date format for non-empty dates
    for (const date of collection_dates) {
      if (date && date !== '' && !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return NextResponse.json(
          { error: 'Invalid date format. Use YYYY-MM-DD' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from('payment_groups')
      .update({ collection_dates })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating collection dates:', error);
    return NextResponse.json({ error: 'Failed to update collection dates' }, { status: 500 });
  }
}
