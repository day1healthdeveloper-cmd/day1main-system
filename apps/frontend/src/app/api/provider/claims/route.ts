import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const providerId = searchParams.get('providerId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Get provider's claims
    const { data: claims, error: claimsError } = await supabase
      .from('claims')
      .select('*')
      .eq('provider_id', providerId)
      .order('submission_date', { ascending: false })
      .limit(limit);

    if (claimsError) {
      console.error('Supabase error:', claimsError);
      throw claimsError;
    }

    // Fetch related members
    const memberIds = [...new Set(claims?.map(c => c.member_id).filter(Boolean))];

    const membersResult = memberIds.length > 0
      ? await supabase.from('members').select('id, first_name, last_name, member_number').in('id', memberIds)
      : { data: [] };

    // Create lookup map
    const membersMap = new Map(membersResult.data?.map(m => [m.id, m]) || []);

    // Attach related data to claims
    const enrichedClaims = claims?.map(claim => ({
      ...claim,
      member: claim.member_id ? membersMap.get(claim.member_id) : null
    })) || [];

    // Calculate stats
    const stats = {
      totalClaims: claims?.length || 0,
      pendingClaims: claims?.filter(c => c.status === 'pending').length || 0,
      approvedClaims: claims?.filter(c => c.status === 'approved').length || 0,
      totalApproved: claims
        ?.filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + parseFloat(c.claimed_amount || '0'), 0) || 0,
      totalPending: claims
        ?.filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + parseFloat(c.claimed_amount || '0'), 0) || 0
    };

    return NextResponse.json({ 
      claims: enrichedClaims,
      stats
    });
  } catch (error) {
    console.error('Error fetching provider claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
