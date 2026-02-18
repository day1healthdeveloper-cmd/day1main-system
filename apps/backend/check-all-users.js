const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllUsers() {
  console.log('🔍 Checking all users in database...\n');

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email')
    .order('email');

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`Found ${users.length} users:\n`);
  
  for (const user of users) {
    // Get roles separately
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select(`
        roles (name)
      `)
      .eq('user_id', user.id);
    
    const roles = userRoles?.map(ur => ur.roles.name).join(', ') || 'NO ROLE';
    console.log(`📧 ${user.email}`);
    console.log(`   Role: ${roles}\n`);
  }

  // Check what roles exist
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('*')
    .order('name');

  if (!rolesError) {
    console.log('\n📋 Available roles:');
    roles.forEach(role => {
      console.log(`   - ${role.name}`);
    });
  }
}

checkAllUsers();
