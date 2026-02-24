import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();

    // Create the member directly - no contact or application needed
    const { data: member, error } = await supabase
      .from('members')
      .insert({
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
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating member:', error);
      return NextResponse.json({ 
        error: 'Failed to create member', 
        details: error.message,
        hint: error.hint,
        code: error.code 
      }, { status: 400 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error in POST /api/operations/members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const noGroup = searchParams.get('no_group');

    let query = supabase
      .from('members')
      .select('*')
      .eq('status', 'active');

    if (noGroup === 'true') {
      query = query.is('payment_group_id', null);
    }

    const { data: members, error } = await query;

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(members || []);
  } catch (error) {
    console.error('Error in GET /api/operations/members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
