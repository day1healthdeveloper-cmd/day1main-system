const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixComplianceRoles() {
  console.log('🔧 Fixing compliance user roles...\n');

  // Get compliance user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'compliance@day1main.com')
    .single();

  if (userError || !user) {
    console.error('❌ Compliance user not found');
    return;
  }

  console.log(`✅ Found user: ${user.email}`);

  // Get compliance_officer role ID
  const { data: complianceRole, error: roleError } = await supabase
    .from('roles')
    .select('id, name')
    .eq('name', 'compliance_officer')
    .single();

  if (roleError || !complianceRole) {
    console.error('❌ Compliance officer role not found');
    return;
  }

  console.log(`✅ Found role: ${complianceRole.name}`);

  // Delete ALL user_roles for this user
  const { error: deleteError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', user.id);

  if (deleteError) {
    console.error('❌ Error deleting old roles:', deleteError.message);
    return;
  }

  console.log('✅ Deleted all old roles');

  // Insert ONLY compliance_officer role
  const { error: insertError } = await supabase
    .from('user_roles')
    .insert({
      user_id: user.id,
      role_id: complianceRole.id,
    });

  if (insertError) {
    console.error('❌ Error inserting role:', insertError.message);
    return;
  }

  console.log('✅ Assigned compliance_officer role');

  // Verify
  const { data: userRoles, error: verifyError } = await supabase
    .from('user_roles')
    .select(`
      role_id,
      roles (name)
    `)
    .eq('user_id', user.id);

  if (verifyError) {
    console.error('❌ Error verifying:', verifyError.message);
    return;
  }

  console.log('\n✅ Current roles for compliance@day1main.com:');
  userRoles.forEach(ur => {
    console.log(`  - ${ur.roles.name}`);
  });

  console.log('\n✅ Done! User now has ONLY compliance_officer role.');
  console.log('💡 Please logout and login again.');
}

fixComplianceRoles();
