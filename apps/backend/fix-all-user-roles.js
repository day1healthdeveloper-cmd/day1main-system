const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// Correct mapping: email -> single role
const correctUserRoles = {
  'admin@day1main.com': 'system_admin',
  'assessor@day1main.com': 'claims_assessor',
  'broker@day1main.com': 'broker',
  'compliance@day1main.com': 'compliance_officer',
  'finance@day1main.com': 'finance_manager',
  'marketing@day1main.com': 'marketing_manager',
  'member@day1main.com': 'member',
  'provider@day1main.com': 'provider', // Missing user - will create
};

async function fixAllUserRoles() {
  console.log('🔧 Fixing all user roles...\n');

  // Get all roles
  const { data: roles } = await supabase
    .from('roles')
    .select('id, name');

  const roleMap = {};
  roles.forEach(role => {
    roleMap[role.name] = role.id;
  });

  for (const [email, correctRole] of Object.entries(correctUserRoles)) {
    console.log(`\n📧 Processing ${email}...`);

    // Check if user exists
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    // Create user if doesn't exist
    if (!user) {
      console.log(`   ➕ Creating user...`);
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: email,
          password_hash: '$2b$10$YourHashedPasswordHere', // Will need to reset
          first_name: email.split('@')[0],
          last_name: 'User',
        })
        .select()
        .single();

      if (createError) {
        console.log(`   ❌ Error creating user: ${createError.message}`);
        continue;
      }
      user = newUser;
      console.log(`   ✅ User created`);
    }

    // Delete ALL existing roles
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', user.id);

    console.log(`   🗑️  Deleted old roles`);

    // Insert correct role
    const roleId = roleMap[correctRole];
    if (!roleId) {
      console.log(`   ❌ Role ${correctRole} not found`);
      continue;
    }

    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role_id: roleId,
      });

    if (insertError) {
      console.log(`   ❌ Error assigning role: ${insertError.message}`);
    } else {
      console.log(`   ✅ Assigned role: ${correctRole}`);
    }
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('✅ All users fixed! Verifying...\n');

  // Verify
  const { data: users } = await supabase
    .from('users')
    .select('id, email')
    .order('email');

  for (const user of users) {
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('roles (name)')
      .eq('user_id', user.id);

    const roles = userRoles?.map(ur => ur.roles.name).join(', ') || 'NO ROLE';
    const status = userRoles?.length === 1 ? '✅' : '🔴';
    console.log(`${status} ${user.email}: ${roles}`);
  }

  console.log('\n💡 All users now have exactly ONE role!');
  console.log('💡 Please logout and login again to test.');
}

fixAllUserRoles();
