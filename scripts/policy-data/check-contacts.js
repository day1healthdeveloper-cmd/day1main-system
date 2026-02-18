/**
 * Check Contacts in Supabase
 * Run: node check-contacts.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function checkContacts() {
  console.log('🔍 Checking Contacts Table...\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/contacts?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contacts = await response.json();
    
    console.log(`✅ Found ${contacts.length} contacts:\n`);
    
    contacts.forEach((contact, index) => {
      console.log(`Contact ${index + 1}:`);
      console.log(`  ID: ${contact.id}`);
      console.log(`  Name: ${contact.first_name} ${contact.last_name}`);
      console.log(`  Email: ${contact.email}`);
      console.log(`  Mobile: ${contact.mobile || 'N/A'}`);
      console.log(`  Is Lead: ${contact.is_lead}`);
      console.log(`  Is Applicant: ${contact.is_applicant}`);
      console.log(`  Is Member: ${contact.is_member}`);
      console.log(`  Source: ${contact.source || 'N/A'}`);
      console.log(`  Created: ${contact.created_at}`);
      console.log(`  Updated: ${contact.updated_at || 'N/A'}`);
      console.log('---\n');
    });

  } catch (error) {
    console.error('❌ Failed to fetch contacts!\n');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkContacts();
