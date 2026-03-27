import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all claims that require pre-authorization
    const { data: claims, error: claimsError } = await supabase
      .from('claims')
      .select('*')
      .eq('pre_auth_required', true)
      .order('submission_date', { ascending: false });

    if (claimsError) {
      console.error('Supabase error:', claimsError);
      throw claimsError;
    }

    // Fetch related providers and members
    const providerIds = [...new Set(claims?.map(c => c.provider_id).filter(Boolean))];
    const memberIds = [...new Set(claims?.map(c => c.member_id).filter(Boolean))];

    const [providersResult, membersResult] = await Promise.all([
      providerIds.length > 0 
        ? supabase.from('providers').select('id, name, provider_number, type').in('id', providerIds)
        : Promise.resolve({ data: [] }),
      memberIds.length > 0
        ? supabase.from('members').select('id, first_name, last_name, member_number').in('id', memberIds)
        : Promise.resolve({ data: [] })
    ]);

    // Create lookup maps
    const providersMap = new Map(providersResult.data?.map(p => [p.id, p]) || []);
    const membersMap = new Map(membersResult.data?.map(m => [m.id, m]) || []);

    // Attach related data to claims
    const enrichedRequests = claims?.map(claim => ({
      ...claim,
      provider: claim.provider_id ? providersMap.get(claim.provider_id) : null,
      member: claim.member_id ? membersMap.get(claim.member_id) : null
    })) || [];

    return NextResponse.json({ requests: enrichedRequests });
  } catch (error) {
    console.error('Error fetching pre-auth requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pre-auth requests', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
