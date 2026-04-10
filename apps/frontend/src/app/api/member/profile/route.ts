import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get session from cookies
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('sb-access-token');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // For now, we'll use a simple approach - get user_id from session
    // In production, you'd decode the JWT token properly
    const userIdCookie = cookieStore.get('user-id');
    
    if (!userIdCookie) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 401 }
      );
    }

    const userId = userIdCookie.value;

    // Fetch member data
    const { data: member, error } = await supabaseAdmin
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error fetching member profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member profile' },
      { status: 500 }
    );
  }
}
