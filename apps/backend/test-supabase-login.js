const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testLogin() {
  console.log('\n🔍 Testing Supabase login...\n');

  try {
    // Find user with corrected foreign key
    console.log('1. Querying user by email with correct FK...');
    const { data: user, error } = await supabase
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

    if (error) {
      console.error('❌ Error querying user:', error);
      return;
    }

    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.email);
    console.log('   Password hash:', user.password_hash?.substring(0, 20) + '...');
    console.log('   Roles:', user.user_roles?.map(ur => ur.role?.name));

    // Verify password
    console.log('\n2. Verifying password...');
    const isPasswordValid = await bcrypt.compare('admin123', user.password_hash);
    console.log('   Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.error('❌ Invalid password');
      return;
    }

    console.log('\n✅ Login would succeed!');
    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Active:', user.is_active);

  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

testLogin();
