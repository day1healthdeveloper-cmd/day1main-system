require('dotenv').config({ path: 'apps/backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMembersTable() {
  console.log('Checking members table structure...\n');

  // Get table columns
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error querying members table:', error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log('Members table columns:');
    console.log(Object.keys(data[0]));
  } else {
    console.log('No members found in table');
    
    // Try to get table info from information_schema
    const { data: columns, error: colError } = await supabase.rpc('get_table_columns', {
      table_name: 'members'
    });
    
    if (colError) {
      console.log('Could not get column info:', colError.message);
    }
  }
}

checkMembersTable();
