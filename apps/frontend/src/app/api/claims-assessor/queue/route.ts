import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');

    // Build query for claims
    let query = supabase
      .from('claims')
      .select('*')
      .order('submission_date', { ascending: false });

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: claims, error: claimsError } = await query;

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
    const enrichedClaims = claims?.map(claim => ({
      ...claim,
      provider: claim.provider_id ? providersMap.get(claim.provider_id) : null,
      member: claim.member_id ? membersMap.get(claim.member_id) : null
    })) || [];

    return NextResponse.json({ claims: enrichedClaims });
  } catch (error) {
    console.error('Error fetching claims queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims queue', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
