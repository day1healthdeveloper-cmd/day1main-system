import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createServerSupabaseClient()
    // Fetch all members
    const { data: members, error } = await supabaseAdmin
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform members to match the expected format
    const transformedMembers = members.map(member => ({
      id: member.id,
      memberNumber: member.member_number,
      firstName: member.first_name,
      lastName: member.last_name,
      idNumber: member.id_number,
      email: member.email,
      phone: member.mobile,
      status: member.status,
      policyNumber: `POL-${member.member_number}`, // TODO: Get from policies table
      product: member.plan_name || 'N/A',
      joinDate: member.activated_at || member.created_at,
      kycStatus: member.status === 'active' ? 'verified' : 'pending',
      riskScore: 0, // TODO: Calculate risk score
    }))

    // Calculate stats
    const stats = {
      total: members.length,
      active: members.filter(m => m.status === 'active').length,
      pending: members.filter(m => m.status === 'pending').length,
      kycPending: members.filter(m => m.status === 'pending').length,
    }

    return NextResponse.json({ 
      members: transformedMembers, 
      stats 
    })
  } catch (error) {
    console.error('Failed to fetch members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
