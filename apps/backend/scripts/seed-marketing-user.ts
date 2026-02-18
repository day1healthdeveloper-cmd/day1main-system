/**
 * Seed Marketing User
 * Creates a marketing manager role and test user
 */

import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedMarketingUser() {
  console.log('🌱 Seeding Marketing User...\n');

  try {
    // 1. Create marketing_manager role
    console.log('Creating marketing_manager role...');
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'marketing_manager')
      .single();

    let roleId: string;

    if (existingRole) {
      console.log('✓ Role already exists');
      roleId = existingRole.id;
    } else {
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .insert({
          name: 'marketing_manager',
          description: 'Marketing Manager - Manages leads, campaigns, and referrals',
        })
        .select()
        .single();

      if (roleError) throw roleError;
      roleId = role.id;
      console.log('✓ Role created');
    }

    // 2. Create marketing permissions
    console.log('\nCreating marketing permissions...');
    const permissions = [
      { name: 'marketing:leads:read', resource: 'marketing', action: 'read', description: 'Read leads' },
      { name: 'marketing:leads:create', resource: 'marketing', action: 'create', description: 'Create leads' },
      { name: 'marketing:leads:update', resource: 'marketing', action: 'update', description: 'Update leads' },
      { name: 'marketing:campaigns:read', resource: 'marketing', action: 'read', description: 'Read campaigns' },
      { name: 'marketing:campaigns:create', resource: 'marketing', action: 'create', description: 'Create campaigns' },
      { name: 'marketing:campaigns:update', resource: 'marketing', action: 'update', description: 'Update campaigns' },
      { name: 'marketing:referrals:read', resource: 'marketing', action: 'read', description: 'Read referrals' },
      { name: 'marketing:referrals:create', resource: 'marketing', action: 'create', description: 'Create referrals' },
      { name: 'marketing:referrals:update', resource: 'marketing', action: 'update', description: 'Update referrals' },
    ];

    const permissionIds: string[] = [];

    for (const perm of permissions) {
      const { data: existingPerm } = await supabase
        .from('permissions')
        .select('id')
        .eq('name', perm.name)
        .single();

      if (existingPerm) {
        permissionIds.push(existingPerm.id);
        console.log(`✓ Permission ${perm.name} already exists`);
      } else {
        const { data: newPerm, error: permError } = await supabase
          .from('permissions')
          .insert(perm)
          .select()
          .single();

        if (permError) throw permError;
        permissionIds.push(newPerm.id);
        console.log(`✓ Permission ${perm.name} created`);
      }
    }

    // 3. Assign permissions to role
    console.log('\nAssigning permissions to marketing_manager role...');
    for (const permId of permissionIds) {
      const { data: existing } = await supabase
        .from('role_permissions')
        .select('id')
        .eq('role_id', roleId)
        .eq('permission_id', permId)
        .single();

      if (!existing) {
        await supabase
          .from('role_permissions')
          .insert({
            role_id: roleId,
            permission_id: permId,
          });
      }
    }
    console.log('✓ Permissions assigned');

    // 4. Create marketing user
    console.log('\nCreating marketing user...');
    const email = 'marketing@day1main.com';
    const password = 'marketing123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    let userId: string;

    if (existingUser) {
      console.log('✓ User already exists');
      userId = existingUser.id;
    } else {
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: hashedPassword,
          is_active: true,
          email_verified: true,
        })
        .select()
        .single();

      if (userError) throw userError;
      userId = user.id;
      console.log('✓ User created');

      // Create profile
      await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          first_name: 'Marketing',
          last_name: 'Manager',
          phone: '+27123456789',
        });
      console.log('✓ Profile created');
    }

    // 5. Assign role to user
    console.log('\nAssigning marketing_manager role to user...');
    const { data: existingUserRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .single();

    if (!existingUserRole) {
      await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId,
        });
      console.log('✓ Role assigned');
    } else {
      console.log('✓ Role already assigned');
    }

    console.log('\n✅ Marketing user seeded successfully!\n');
    console.log('Login credentials:');
    console.log('  Email: marketing@day1main.com');
    console.log('  Password: marketing123');
    console.log('  Role: Marketing Manager\n');

  } catch (error) {
    console.error('❌ Error seeding marketing user:', error);
    process.exit(1);
  }
}

seedMarketingUser();
