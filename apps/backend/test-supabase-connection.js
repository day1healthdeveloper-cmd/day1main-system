require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Testing Supabase Connection');
console.log('URL:', supabaseUrl);
console.log('Key (first 20 chars):', supabaseKey?.substring(0, 20) + '...');
console.log('Key length:', supabaseKey?.length);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('✅ Supabase client created');

async function testConnection() {
  try {
    console.log('\n🔍 Testing connection by querying users table...');
    const { data, error, count } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .limit(1);

    if (error) {
      console.error('❌ Error:', error.message);
      console.error('Details:', error);
      return;
    }

    console.log('✅ Connected to Supabase successfully');
    console.log('📊 User count:', count || 0);
    console.log('📝 Sample data:', data);
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

testConnection();
