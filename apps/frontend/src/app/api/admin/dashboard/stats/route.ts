import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all statistics in parallel
    const [
      membersResult,
      activeMembersResult,
      pendingMembersResult,
      suspendedMembersResult,
      policiesResult,
      claimsResult,
      preauthsResult,
      providersResult,
      brokersResult,
    ] = await Promise.all([
      // Total members
      supabase.from('members').select('id', { count: 'exact', head: true }),
      
      // Active members
      supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      
      // Pending members
      supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      
      // Suspended members
      supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
      
      // Active policies
      supabase.from('policies').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      
      // Pending claims
      supabase.from('claims').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      
      // Pending preauths
      supabase.from('preauths').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      
      // Total providers
      supabase.from('providers').select('id', { count: 'exact', head: true }),
      
      // Active brokers (count distinct broker_code from members)
      supabase.from('members').select('broker_code'),
    ]);

    // Check for errors
    if (membersResult.error) throw membersResult.error;
    if (activeMembersResult.error) throw activeMembersResult.error;
    if (pendingMembersResult.error) throw pendingMembersResult.error;
    if (suspendedMembersResult.error) throw suspendedMembersResult.error;
    if (policiesResult.error) throw policiesResult.error;
    if (claimsResult.error) throw claimsResult.error;
    if (preauthsResult.error) throw preauthsResult.error;
    if (providersResult.error) throw providersResult.error;
    if (brokersResult.error) throw brokersResult.error;

    // Count unique broker codes
    const uniqueBrokers = new Set(
      brokersResult.data
        ?.map((m: any) => m.broker_code)
        .filter((code: string | null) => code && code.trim() !== '')
    );

    const stats = {
      totalMembers: membersResult.count || 0,
      activeMembers: activeMembersResult.count || 0,
      pendingMembers: pendingMembersResult.count || 0,
      suspendedMembers: suspendedMembersResult.count || 0,
      activePolicies: policiesResult.count || 0,
      pendingClaims: claimsResult.count || 0,
      pendingPreauths: preauthsResult.count || 0,
      totalProviders: providersResult.count || 0,
      activeBrokers: uniqueBrokers.size,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
