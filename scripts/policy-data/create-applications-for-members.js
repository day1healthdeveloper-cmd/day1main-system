/**
 * Create Application Records for Existing Members
 * Run: node create-applications-for-members.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function createApplications() {
  console.log('🔍 Creating application records for existing members...\n');

  try {
    // Get all members
    const membersResponse = await fetch(`${SUPABASE_URL}/rest/v1/members?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    const members = await membersResponse.json();
    console.log(`✅ Found ${members.length} members\n`);

    // Create application for each member
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      
      // Generate application reference number
      const appRef = `APP-2026-${String(i + 1).padStart(6, '0')}`;
      
      const applicationData = {
        application_reference: appRef,
        status: 'approved',
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone: member.phone || '+27123456789',
        id_number: member.id_number || '0000000000000',
        date_of_birth: member.date_of_birth || '1990-01-01',
        gender: member.gender || 'other',
        address_line1: member.address_line1 || '123 Main Street',
        address_line2: member.address_line2 || '',
        city: member.city || 'Cape Town',
        province: member.province || 'Western Cape',
        postal_code: member.postal_code || '8001',
        plan_type: member.plan_type || 'platinum',
        coverage_type: member.coverage_type || 'single',
        monthly_premium: member.monthly_premium || 560,
        payment_method: 'debit_order',
        bank_name: 'Standard Bank',
        account_holder: `${member.first_name} ${member.last_name}`,
        account_number: '1234567890',
        branch_code: '051001',
        account_type: 'cheque',
        debit_order_day: 1,
        consent_terms: true,
        consent_privacy: true,
        consent_marketing: false,
        created_at: member.created_at,
        updated_at: member.created_at,
        approved_at: member.created_at,
        approved_by: 'system'
      };

      const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/applications`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(applicationData)
      });

      if (createResponse.ok) {
        const created = await createResponse.json();
        console.log(`✅ Created application ${appRef} for ${member.first_name} ${member.last_name}`);
      } else {
        const error = await createResponse.text();
        console.error(`❌ Failed to create application for ${member.first_name}: ${error}`);
      }
    }

    console.log('\n✅ All applications created successfully!');
    console.log('\nRefresh the applications page to see the results.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createApplications();
