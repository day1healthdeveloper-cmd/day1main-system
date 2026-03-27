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
      dependantsResult,
      activeMembersResult,
      activeDependantsResult,
      pendingMembersResult,
      suspendedMembersResult,
      suspendedDependantsResult,
      inactiveMembersResult,
      inactiveDependantsResult,
      policiesResult,
      claimsResult,
      preauthsResult,
      providersResult,
      brokersResult,
    ] = await Promise.all([
      // Total members
      supabase.from('members').select('id', { count: 'exact', head: true }),
      
      // Total dependants
      supabase.from('member_dependants').select('id', { count: 'exact', head: true }),
      
      // Active members
      supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      
      // Active dependants
      supabase.from('member_dependants').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      
      // Pending members
      supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      
      // Suspended members
      supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
      
      // Suspended dependants
      supabase.from('member_dependants').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
      
      // Inactive members
      supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'inactive'),
      
      // Inactive dependants
      supabase.from('member_dependants').select('id', { count: 'exact', head: true }).eq('status', 'inactive'),
      
      // Active policies
      supabase.from('policies').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      
      // Pending claims
      supabase.from('claims').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      
      // Pending preauths
      supabase.from('preauths').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      
      // Total providers
      supabase.from('providers').select('id', { count: 'exact', head: true }),
      
      // Total brokers
      supabase.from('brokers').select('id', { count: 'exact', head: true }),
    ]);

    // Check for errors
    if (membersResult.error) throw membersResult.error;
    if (dependantsResult.error) throw dependantsResult.error;
    if (activeMembersResult.error) throw activeMembersResult.error;
    if (activeDependantsResult.error) throw activeDependantsResult.error;
    if (pendingMembersResult.error) throw pendingMembersResult.error;
    if (suspendedMembersResult.error) throw suspendedMembersResult.error;
    if (suspendedDependantsResult.error) throw suspendedDependantsResult.error;
    if (inactiveMembersResult.error) throw inactiveMembersResult.error;
    if (inactiveDependantsResult.error) throw inactiveDependantsResult.error;
    if (policiesResult.error) throw policiesResult.error;
    if (claimsResult.error) throw claimsResult.error;
    if (preauthsResult.error) throw preauthsResult.error;
    if (providersResult.error) throw providersResult.error;
    if (brokersResult.error) throw brokersResult.error;

    const stats = {
      totalMembers: (membersResult.count || 0) + (dependantsResult.count || 0),
      activeMembers: (activeMembersResult.count || 0) + (activeDependantsResult.count || 0),
      pendingMembers: pendingMembersResult.count || 0,
      suspendedMembers: (suspendedMembersResult.count || 0) + (suspendedDependantsResult.count || 0) + (inactiveMembersResult.count || 0) + (inactiveDependantsResult.count || 0),
      activePolicies: policiesResult.count || 0,
      pendingClaims: claimsResult.count || 0,
      pendingPreauths: preauthsResult.count || 0,
      totalProviders: providersResult.count || 0,
      activeBrokers: brokersResult.count || 0,
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
