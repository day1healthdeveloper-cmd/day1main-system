import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('payment_groups')
      .select('*')
      .order('group_name');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching payment groups:', error);
    return NextResponse.json({ error: 'Failed to fetch payment groups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();

    // Auto-generate group_code from group_name if not provided
    if (!body.group_code) {
      const groupCode = body.group_name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
      body.group_code = groupCode;
    }

    // Set group_type based on collection_method if not provided
    if (!body.group_type) {
      body.group_type = body.collection_method === 'group_debit_order' ? 'debit_order_group' : 'eft_group';
    }

    const { data, error } = await supabase
      .from('payment_groups')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating payment group:', error);
    return NextResponse.json({ error: 'Failed to create payment group' }, { status: 500 });
  }
}
