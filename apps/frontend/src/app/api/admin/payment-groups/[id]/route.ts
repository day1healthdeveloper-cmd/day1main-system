import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();

    // Auto-generate group_code from group_name if not provided
    if (!body.group_code && body.group_name) {
      const groupCode = body.group_name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
      body.group_code = groupCode;
    }

    // Set group_type based on collection_method if not provided
    if (!body.group_type && body.collection_method) {
      body.group_type = body.collection_method === 'group_debit_order' ? 'debit_order_group' : 'eft_group';
    }

    const { data, error } = await supabase
      .from('payment_groups')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating payment group:', error);
    return NextResponse.json({ error: 'Failed to update payment group' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from('payment_groups')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment group:', error);
    return NextResponse.json({ error: 'Failed to delete payment group' }, { status: 500 });
  }
}
