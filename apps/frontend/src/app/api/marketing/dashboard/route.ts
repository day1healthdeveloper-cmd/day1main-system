import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    // Fetch contacts for lead stats
    const { data: contacts, error: contactsError } = await supabaseAdmin
      .from('contacts')
      .select('*')

    if (contactsError) throw contactsError

    // Fetch applications for conversion stats
    const { data: applications, error: appsError } = await supabaseAdmin
      .from('applications')
      .select('*')

    if (appsError) throw appsError

    // Fetch members for conversion stats
    const { data: members, error: membersError } = await supabaseAdmin
      .from('members')
      .select('*')

    if (membersError) throw membersError

    // Calculate stats
    const totalLeads = contacts.length
    const totalApplications = applications.length
    const totalMembers = members.length
    
    // Lead pipeline
    const newLeads = contacts.filter(c => c.is_lead && !c.is_applicant).length
    const contacted = contacts.filter(c => c.last_contacted_at).length
    const qualified = contacts.filter(c => c.is_applicant).length
    const converted = contacts.filter(c => c.is_member).length

    // Lifecycle stages (based on lead score)
    const hotLeads = contacts.filter(c => c.is_lead && (c.lead_score || 0) >= 80).length
    const warmLeads = contacts.filter(c => c.is_lead && (c.lead_score || 0) >= 60 && (c.lead_score || 0) < 80).length
    const coldLeads = contacts.filter(c => c.is_lead && (c.lead_score || 0) < 60).length

    // Conversion rate
    const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : '0.0'

    // Recent leads (last 5)
    const recentLeads = contacts
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(contact => ({
        name: `${contact.first_name} ${contact.last_name}`,
        email: contact.email,
        source: contact.source || 'web',
        status: contact.is_member ? 'Converted' : contact.is_applicant ? 'Qualified' : contact.last_contacted_at ? 'Contacted' : 'New',
        score: contact.lead_score || 0,
      }))

    // Lead sources
    const sources = contacts.reduce((acc: any, contact) => {
      const source = contact.source || 'unknown'
      if (!acc[source]) {
        acc[source] = { count: 0, converted: 0 }
      }
      acc[source].count++
      if (contact.is_member) {
        acc[source].converted++
      }
      return acc
    }, {})

    const leadSources = Object.entries(sources).map(([source, data]: [string, any]) => ({
      source: source.charAt(0).toUpperCase() + source.slice(1),
      leads: data.count,
      conversion: data.count > 0 ? Math.round((data.converted / data.count) * 100) : 0,
    }))

    const stats = {
      totalLeads,
      activeCampaigns: 0, // TODO: Implement campaigns table
      conversionRate: parseFloat(conversionRate),
      referrals: 0, // TODO: Implement referrals tracking
      pipeline: {
        new: newLeads,
        contacted,
        qualified,
        converted,
      },
      lifecycle: {
        hot: hotLeads,
        warm: warmLeads,
        cold: coldLeads,
      },
      recentLeads,
      leadSources,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Failed to fetch marketing dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
