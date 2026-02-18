const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env from backend (go up one directory)
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

async function addPermissions() {
  console.log('🚀 Adding debit order permissions to operations_manager role...\n');

  // First, check the permissions table structure
  const { data: samplePerm, error: sampleError } = await supabase
    .from('permissions')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (samplePerm) {
    console.log('📋 Permissions table structure:', Object.keys(samplePerm));
    console.log('Sample permission:', samplePerm);
    console.log('');
  }

  // Get operations_manager role
  const { data: roles, error: roleError } = await supabase
    .from('roles')
    .select('id, name')
    .eq('name', 'operations_manager')
    .single();

  if (roleError || !roles) {
    console.log('❌ operations_manager role not found:', roleError);
    return;
  }

  console.log(`✅ Found operations_manager role (ID: ${roles.id})\n`);

  // Permissions to add
  const permissionsToAdd = [
    { name: 'debit_orders:read', resource: 'debit_orders', action: 'read', description: 'Permission to read debit orders' },
    { name: 'debit_orders:create', resource: 'debit_orders', action: 'create', description: 'Permission to create debit orders' },
    { name: 'debit_orders:update', resource: 'debit_orders', action: 'update', description: 'Permission to update debit orders' },
    { name: 'debit_orders:delete', resource: 'debit_orders', action: 'delete', description: 'Permission to delete debit orders' },
  ];

  console.log('📝 Creating permissions and assigning to role...\n');

  for (const perm of permissionsToAdd) {
    // Check if permission exists
    let { data: existingPerm, error: checkError } = await supabase
      .from('permissions')
      .select('id, name')
      .eq('name', perm.name)
      .maybeSingle();

    let permissionId;

    if (existingPerm) {
      permissionId = existingPerm.id;
      console.log(`  ✓ ${perm.name} already exists (ID: ${permissionId})`);
    } else {
      // Create permission
      const { data: newPerm, error: createError } = await supabase
        .from('permissions')
        .insert({
          name: perm.name,
          resource: perm.resource,
          action: perm.action,
          description: perm.description,
        })
        .select()
        .single();

      if (createError) {
        console.log(`  ❌ Failed to create ${perm.name}:`, createError.message);
        continue;
      }

      permissionId = newPerm.id;
      console.log(`  ✅ Created ${perm.name} (ID: ${permissionId})`);
    }

    // Check if role_permission already exists
    const { data: existingRP, error: rpCheckError } = await supabase
      .from('role_permissions')
      .select('id')
      .eq('role_id', roles.id)
      .eq('permission_id', permissionId)
      .maybeSingle();

    if (existingRP) {
      console.log(`  → Already assigned to operations_manager`);
    } else {
      // Assign permission to role
      const { error: assignError } = await supabase
        .from('role_permissions')
        .insert({
          role_id: roles.id,
          permission_id: permissionId,
        });

      if (assignError) {
        console.log(`  ❌ Failed to assign:`, assignError.message);
      } else {
        console.log(`  → Assigned to operations_manager`);
      }
    }
  }

  console.log('\n✅ Debit order permissions added successfully!');
  console.log('\n📋 Verifying...\n');

  // Verify
  const { data: rolePerms, error: verifyError } = await supabase
    .from('role_permissions')
    .select('permission:permissions(name)')
    .eq('role_id', roles.id);

  if (verifyError) {
    console.log('❌ Verification failed:', verifyError.message);
    return;
  }

  console.log(`✅ operations_manager now has ${rolePerms.length} permissions:`);
  rolePerms.forEach(rp => {
    if (rp.permission) {
      console.log(`  - ${rp.permission.name}`);
    }
  });

  console.log('\n🔄 Please refresh your browser to see the groups!');
}

addPermissions();
