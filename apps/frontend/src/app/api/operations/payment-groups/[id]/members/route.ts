import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('members')
      .select('id, member_number, first_name, last_name, id_number, date_of_birth, monthly_premium, employee_number, payment_group_id, collection_method, phone, email')
      .eq('payment_group_id', params.id)
      .order('member_number');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching group members:', error);
    return NextResponse.json({ error: 'Failed to fetch group members' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const { member_id } = body;

    // Get group info to set collection method
    const { data: group } = await supabase
      .from('payment_groups')
      .select('collection_method')
      .eq('id', params.id)
      .single();

    const { data, error } = await supabase
      .from('members')
      .update({
        payment_group_id: params.id,
        collection_method: group?.collection_method || 'group_debit_order',
      })
      .eq('id', member_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding member to group:', error);
    return NextResponse.json({ error: 'Failed to add member to group' }, { status: 500 });
  }
}
