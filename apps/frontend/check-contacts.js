const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkContacts() {
  console.log('Checking contacts table...\n');
  
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total contacts found: ${data.length}\n`);
  
  data.forEach((contact, index) => {
    console.log(`Contact ${index + 1}:`);
    console.log(`  ID: ${contact.id}`);
    console.log(`  Name: ${contact.first_name} ${contact.last_name}`);
    console.log(`  Email: ${contact.email}`);
    console.log(`  Mobile: ${contact.mobile}`);
    console.log(`  Is Lead: ${contact.is_lead}`);
    console.log(`  Is Applicant: ${contact.is_applicant}`);
    console.log(`  Is Member: ${contact.is_member}`);
    console.log(`  Created: ${contact.created_at}`);
    console.log('---');
  });
}

checkContacts();
