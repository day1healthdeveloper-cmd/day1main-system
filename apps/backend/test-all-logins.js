const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testUsers = [
  { email: 'admin@day1main.com', password: 'admin123', role: 'System Admin' },
  { email: 'member@day1main.com', password: 'member123', role: 'Member' },
  { email: 'broker@day1main.com', password: 'broker123', role: 'Broker' },
  { email: 'assessor@day1main.com', password: 'assessor123', role: 'Claims Assessor' },
  { email: 'compliance@day1main.com', password: 'compliance123', role: 'Compliance Officer' },
  { email: 'finance@day1main.com', password: 'finance123', role: 'Finance Manager' },
];

async function testLogin(email, password, expectedRole) {
  try {
    console.log(`\n🔍 Testing: ${email} (${expectedRole})`);

    // Query user
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        profile:profiles(*),
        user_roles!user_roles_user_id_fkey(
          role:roles(*)
        )
      `)
      .eq('email', email)
      .single();

    if (error) {
      console.error(`   ❌ Query error: ${error.message}`);
      return false;
    }

    if (!user) {
      console.error('   ❌ User not found');
      return false;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      console.error('   ❌ Invalid password');
      return false;
    }

    // Check active status
    if (!user.is_active) {
      console.error('   ❌ User inactive');
      return false;
    }

    // Get roles
    const roles = user.user_roles?.map(ur => ur.role?.name) || [];
    
    console.log(`   ✅ SUCCESS`);
    console.log(`      User ID: ${user.id}`);
    console.log(`      Email: ${user.email}`);
    console.log(`      Active: ${user.is_active}`);
    console.log(`      Roles: ${roles.join(', ')}`);
    console.log(`      Profile: ${user.profile?.first_name} ${user.profile?.last_name}`);

    return true;
  } catch (err) {
    console.error(`   ❌ Exception: ${err.message}`);
    return false;
  }
}

async function testAllLogins() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔐 TESTING ALL USER LOGINS');
  console.log('═══════════════════════════════════════════════════════');

  let successCount = 0;
  let failCount = 0;

  for (const testUser of testUsers) {
    const success = await testLogin(testUser.email, testUser.password, testUser.role);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 RESULTS');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Successful: ${successCount}/${testUsers.length}`);
  console.log(`❌ Failed: ${failCount}/${testUsers.length}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (failCount === 0) {
    console.log('🎉 All logins working correctly!\n');
  } else {
    console.log('⚠️  Some logins failed - check errors above\n');
  }
}

testAllLogins();
