const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key (first 20 chars):', supabaseKey?.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testQuery() {
  console.log('\n📊 Querying users table...');
  
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      profile:profiles(*),
      user_roles!user_roles_user_id_fkey(
        role:roles(*)
      )
    `)
    .eq('email', 'admin@day1main.com')
    .single();

  console.log('\n📊 Query result:');
  console.log('Data:', data ? 'Found user' : 'No data');
  console.log('Error:', error);
  
  if (data) {
    console.log('\n✅ User details:');
    console.log('- ID:', data.id);
    console.log('- Email:', data.email);
    console.log('- Active:', data.is_active);
    console.log('- Profile:', data.profile);
    console.log('- Roles:', data.user_roles);
  }
}

testQuery().catch(console.error);
