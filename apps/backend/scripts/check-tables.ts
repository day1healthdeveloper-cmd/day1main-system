import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('Checking users table...');
  
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (usersError) {
    console.error('Users table error:', usersError);
  } else {
    console.log('Users table columns:', users && users[0] ? Object.keys(users[0]) : 'No data');
  }

  console.log('\nChecking profiles table...');
  
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
  
  if (profilesError) {
    console.error('Profiles table error:', profilesError);
  } else {
    console.log('Profiles table columns:', profiles && profiles[0] ? Object.keys(profiles[0]) : 'No data');
  }

  console.log('\nChecking user_roles table...');
  
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*')
    .limit(1);
  
  if (rolesError) {
    console.error('User_roles table error:', rolesError);
  } else {
    console.log('User_roles table columns:', roles && roles[0] ? Object.keys(roles[0]) : 'No data');
  }
}

checkTables();
