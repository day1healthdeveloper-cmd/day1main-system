import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const cookieStore = cookies();
    const userIdCookie = cookieStore.get('user-id');
    
    if (!userIdCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = userIdCookie.value;

    // Get member ID
    const { data: member } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Fetch member's claims
    const { data: claims, error } = await supabaseAdmin
      .from('claims')
      .select('*')
      .eq('member_id', member.id)
      .order('submission_date', { ascending: false });

    if (error) {
      console.error('Error fetching claims:', error);
      return NextResponse.json(
        { error: 'Failed to fetch claims' },
        { status: 500 }
      );
    }

    return NextResponse.json(claims || []);
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}
