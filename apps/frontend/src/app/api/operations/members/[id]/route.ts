import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id } = params;

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
        payment_group_id: body.payment_group_id,
        collection_method: body.collection_method,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating member:', error);
      return NextResponse.json({ 
        error: 'Failed to update member', 
        details: error.message,
        hint: error.hint,
        code: error.code 
      }, { status: 400 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error in PUT /api/operations/members/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
