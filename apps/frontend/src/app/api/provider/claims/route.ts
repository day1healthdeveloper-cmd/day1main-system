import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET - Fetch provider's claims
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    // TODO: Get provider_id from authenticated session
    const providerId = searchParams.get('provider_id');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const search = searchParams.get('search'); // For claim number, member number, patient name
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID required' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('claims')
      .select(`
        id,
        claim_number,
        member_id,
        provider_id,
        benefit_type,
        service_date,
        submission_date,
        claimed_amount,
        approved_amount,
        claim_status,
        rejection_reason,
        rejection_code,
        pend_reason,
        approved_date,
        paid_date,
        payment_reference,
        claim_data,
        created_at,
        members (
          member_number,
          first_name,
          last_name
        )
      `)
      .eq('provider_id', providerId)
      .order('submission_date', { ascending: false })
      .limit(limit);

    // Apply filters
    if (status) {
      query = query.eq('claim_status', status);
    }

    if (dateFrom) {
      query = query.gte('service_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('service_date', dateTo);
    }

    // Note: Search filtering will be done in-memory after fetch
    // For production, consider using PostgreSQL full-text search

    const { data: claims, error } = await query;

    if (error) {
      console.error('Error fetching claims:', error);
      throw error;
    }

    // Apply search filter if provided
    let filteredClaims = claims || [];
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filteredClaims = filteredClaims.filter(claim => {
        const claimNumber = claim.claim_number?.toLowerCase() || '';
        const memberNumber = claim.members?.member_number?.toLowerCase() || '';
        const patientName = `${claim.members?.first_name || ''} ${claim.members?.last_name || ''}`.toLowerCase();
        
        return claimNumber.includes(searchLower) ||
               memberNumber.includes(searchLower) ||
               patientName.includes(searchLower);
      });
    }

    // Calculate statistics
    const stats = {
      total: filteredClaims.length,
      submitted: filteredClaims.filter(c => c.claim_status === 'submitted').length,
      pending: filteredClaims.filter(c => c.claim_status === 'pending').length,
      approved: filteredClaims.filter(c => c.claim_status === 'approved').length,
      paid: filteredClaims.filter(c => c.claim_status === 'paid').length,
      rejected: filteredClaims.filter(c => c.claim_status === 'rejected').length,
      pended: filteredClaims.filter(c => c.claim_status === 'pended').length,
      total_claimed: filteredClaims.reduce((sum, c) => sum + parseFloat(c.claimed_amount || '0'), 0),
      total_approved: filteredClaims.reduce((sum, c) => sum + parseFloat(c.approved_amount || '0'), 0),
      total_paid: filteredClaims.filter(c => c.claim_status === 'paid')
        .reduce((sum, c) => sum + parseFloat(c.approved_amount || '0'), 0)
    };

    return NextResponse.json({
      claims: filteredClaims,
      stats
    });

  } catch (error) {
    console.error('Error in provider claims API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch claims',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
