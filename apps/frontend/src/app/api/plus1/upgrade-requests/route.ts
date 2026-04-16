import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const includeMembers = searchParams.get('includeMembers') === 'true';

    let query = supabaseAdmin
      .from('plus1_upgrade_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: upgradeRequests, error } = await query;

    if (error) {
      console.error('Error fetching upgrade requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch upgrade requests' },
        { status: 500 }
      );
    }

    // If includeMembers is true, fetch full member details for each request
    let enrichedRequests = upgradeRequests || [];
    if (includeMembers && upgradeRequests && upgradeRequests.length > 0) {
      enrichedRequests = await Promise.all(
        upgradeRequests.map(async (request) => {
          // Fetch member details from Day1Health database
          const { data: member } = await supabaseAdmin
            .from('members')
            .select('member_number, id_number, date_of_birth, gender, address_line1, address_line2, city, postal_code, plan_name, monthly_premium, status, start_date, broker_code')
            .eq('id', request.member_id)
            .single();

          return {
            ...request,
            member,
          };
        })
      );
    }

    // Get counts by status
    const { data: counts } = await supabaseAdmin
      .from('plus1_upgrade_requests')
      .select('status');

    const stats = {
      pending: counts?.filter(r => r.status === 'pending').length || 0,
      verified: counts?.filter(r => r.status === 'verified').length || 0,
      approved: counts?.filter(r => r.status === 'approved').length || 0,
      rejected: counts?.filter(r => r.status === 'rejected').length || 0,
      total: counts?.length || 0,
    };

    return NextResponse.json({
      upgradeRequests: enrichedRequests,
      stats,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
