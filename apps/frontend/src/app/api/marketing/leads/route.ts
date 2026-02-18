import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    console.log('=== FETCHING LEADS FROM CONTACTS TABLE ===');
    
    // Fetch all contacts (leads, applicants, members)
    const { data: contacts, error, count } = await supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log(`Query result - Total count: ${count}, Rows returned: ${contacts?.length || 0}`);
    
    if (contacts && contacts.length > 0) {
      console.log('Contacts found:');
      contacts.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.first_name} ${c.last_name} (${c.email})`);
      });
    } else {
      console.log('No contacts found!');
    }

    // Transform contacts to leads format
    const leads = (contacts || []).map(contact => ({
      id: contact.id,
      name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
      email: contact.email || 'N/A',
      phone: contact.mobile || 'N/A',
      source: contact.source || 'unknown',
      status: contact.is_member ? 'converted' : contact.is_applicant ? 'qualified' : 'new',
      lifecycle: contact.lead_score >= 80 ? 'hot' : contact.lead_score >= 60 ? 'warm' : 'cold',
      leadScore: contact.lead_score || 0,
      assignedTo: null,
      createdDate: new Date(contact.created_at).toLocaleDateString(),
      createdTime: new Date(contact.created_at).toLocaleTimeString(),
      createdDateTime: new Date(contact.created_at).toLocaleString(),
      lastActivity: new Date(contact.updated_at || contact.created_at).toLocaleDateString(),
      lastActivityTime: new Date(contact.updated_at || contact.created_at).toLocaleTimeString(),
      lastActivityDateTime: new Date(contact.updated_at || contact.created_at).toLocaleString(),
      marketingConsent: contact.marketing_consent || false,
      emailConsent: contact.email_consent || false,
      smsConsent: contact.sms_consent || false,
      phoneConsent: contact.phone_consent || false,
      tags: contact.tags || [],
      isApplicant: contact.is_applicant || false,
      isMember: contact.is_member || false,
      isRejected: contact.is_rejected || false,
    }))

    console.log(`Transformed to ${leads.length} leads`);
    console.log('=== END FETCHING LEADS ===\n');

    // Calculate stats
    const stats = {
      total: leads.length,
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      qualified: leads.filter(l => l.status === 'qualified').length,
      converted: leads.filter(l => l.status === 'converted').length,
      lost: leads.filter(l => l.isRejected).length,
      hot: leads.filter(l => l.lifecycle === 'hot').length,
      warm: leads.filter(l => l.lifecycle === 'warm').length,
      cold: leads.filter(l => l.lifecycle === 'cold').length,
    }

    return NextResponse.json({ leads, stats })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}
