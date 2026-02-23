require('dotenv').config({ path: 'apps/backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('Checking actual database schema...\n');

  // Check members table
  const { data: membersData, error: membersError } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'members'
        ORDER BY ordinal_position;
      `
    });

  if (membersError) {
    console.log('Trying alternative method...');
    
    // Try direct query
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .limit(0);
    
    console.log('Members table exists:', !error);
    if (error) {
      console.log('Error:', error.message);
    }
  } else {
    console.log('MEMBERS TABLE COLUMNS:');
    console.log(membersData);
  }

  // Check contacts table
  const { data: contactsData, error: contactsError } = await supabase
    .from('contacts')
    .select('*')
    .limit(0);
  
  console.log('\nCONTACTS TABLE exists:', !contactsError);
  if (contactsError) {
    console.log('Error:', contactsError.message);
  }

  // Check applications table
  const { data: appsData, error: appsError } = await supabase
    .from('applications')
    .select('*')
    .limit(0);
  
  console.log('\nAPPLICATIONS TABLE exists:', !appsError);
  if (appsError) {
    console.log('Error:', appsError.message);
  }
}

checkSchema();
