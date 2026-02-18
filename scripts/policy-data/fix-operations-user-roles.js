const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env from backend
const envPath = path.join(__dirname, '..', 'apps', 'backend', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/"/g, '');
  }
});

const supabaseUrl = envVars.SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixOperationsUserRoles() {
  console.log('🔧 Fixing operations@day1main.com user roles...\n');

  // Get the user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'operations@day1main.com')
    .single();

  if (userError || !user) {
    console.log('❌ User not found:', userError?.message);
    return;
  }

  console.log(`✅ Found user: ${user.email} (ID: ${user.id})\n`);

  // Get all roles for this user
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role_id, role:roles(id, name)')
    .eq('user_id', user.id);

  if (rolesError) {
    console.log('❌ Error fetching user roles:', rolesError.message);
    return;
  }

  console.log(`📋 Current roles (${userRoles.length}):`);
  userRoles.forEach(ur => {
    console.log(`  - ${ur.role.name} (role_id: ${ur.role_id})`);
  });
  console.log('');

  // Find member role
  const memberRoleAssignment = userRoles.find(ur => ur.role.name === 'member');

  if (memberRoleAssignment) {
    console.log('🗑️  Removing member role...\n');

    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', user.id)
      .eq('role_id', memberRoleAssignment.role_id);

    if (deleteError) {
      console.log('❌ Failed to remove member role:', deleteError.message);
    } else {
      console.log('✅ Member role removed successfully!');
    }
  } else {
    console.log('ℹ️  No member role found (already clean)');
  }

  // Verify final state
  console.log('\n📋 Verifying final roles...\n');

  const { data: finalRoles, error: finalError } = await supabase
    .from('user_roles')
    .select('role:roles(name)')
    .eq('user_id', user.id);

  if (finalError) {
    console.log('❌ Verification failed:', finalError.message);
    return;
  }

  console.log(`✅ Final roles (${finalRoles.length}):`);
  finalRoles.forEach(ur => {
    console.log(`  - ${ur.role.name}`);
  });

  console.log('\n✅ Operations user roles fixed!');
  console.log('🔄 Please log in again to see the correct dashboard.');
}

fixOperationsUserRoles();
