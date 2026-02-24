import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();

    const { data: member, error } = await supabase
      .from('members')
      .update({
        member_number: body.member_number,
        first_name: body.first_name,
        last_name: body.last_name,
        id_number: body.id_number,
        date_of_birth: body.commence_date,
        monthly_premium: body.monthly_premium,
        employee_number: body.employee_number || null,
        phone: body.phone || null,
        email: body.email || null,
        payment_group_id: body.payment_group_id,
        collection_method: body.collection_method,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating member:', error);
      return NextResponse.json({ 
        error: 'Failed to update member', 
        details: error.message 
      }, { status: 400 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error in PUT /api/operations/members/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
