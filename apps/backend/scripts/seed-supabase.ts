import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seed() {
  console.log('🌱 Seeding Supabase database...');

  try {
    // 1. Create roles
    console.log('Creating roles...');
    const roles = [
      { name: 'system_admin', description: 'System Administrator' },
      { name: 'member', description: 'Member' },
      { name: 'broker', description: 'Broker' },
      { name: 'claims_assessor', description: 'Claims Assessor' },
      { name: 'compliance_officer', description: 'Compliance Officer' },
      { name: 'finance_manager', description: 'Finance Manager' },
    ];

    for (const role of roles) {
      const { error } = await supabase
        .from('roles')
        .upsert(role, { onConflict: 'name' });
      
      if (error) console.error(`Error creating role ${role.name}:`, error.message);
      else console.log(`✓ Created role: ${role.name}`);
    }

    // 2. Create permissions
    console.log('\nCreating permissions...');
    const permissions = [
      { name: 'system:admin', resource: 'system', action: 'admin', description: 'Full system access' },
      { name: 'members:read', resource: 'members', action: 'read', description: 'Read member data' },
      { name: 'members:write', resource: 'members', action: 'write', description: 'Write member data' },
      { name: 'policies:read', resource: 'policies', action: 'read', description: 'Read policy data' },
      { name: 'policies:write', resource: 'policies', action: 'write', description: 'Write policy data' },
      { name: 'claims:read', resource: 'claims', action: 'read', description: 'Read claims' },
      { name: 'claims:write', resource: 'claims', action: 'write', description: 'Write claims' },
      { name: 'claims:approve', resource: 'claims', action: 'approve', description: 'Approve claims' },
    ];

    for (const permission of permissions) {
      const { error } = await supabase
        .from('permissions')
        .upsert(permission, { onConflict: 'name' });
      
      if (error) console.error(`Error creating permission ${permission.name}:`, error.message);
      else console.log(`✓ Created permission: ${permission.name}`);
    }

    // 3. Get role IDs
    const { data: rolesData } = await supabase.from('roles').select('id, name');
    const roleMap = new Map(rolesData?.map(r => [r.name, r.id]) || []);

    const { data: permsData } = await supabase.from('permissions').select('id, name');
    const permMap = new Map(permsData?.map(p => [p.name, p.id]) || []);

    // 4. Assign permissions to roles
    console.log('\nAssigning permissions to roles...');
    const rolePermissions = [
      { role: 'system_admin', permission: 'system:admin' },
      { role: 'member', permission: 'members:read' },
      { role: 'member', permission: 'policies:read' },
      { role: 'claims_assessor', permission: 'claims:read' },
      { role: 'claims_assessor', permission: 'claims:write' },
      { role: 'claims_assessor', permission: 'claims:approve' },
    ];

    for (const rp of rolePermissions) {
      const roleId = roleMap.get(rp.role);
      const permId = permMap.get(rp.permission);
      
      if (roleId && permId) {
        const { error } = await supabase
          .from('role_permissions')
          .upsert({ role_id: roleId, permission_id: permId }, { onConflict: 'role_id,permission_id' });
        
        if (error) console.error(`Error assigning ${rp.permission} to ${rp.role}:`, error.message);
        else console.log(`✓ Assigned ${rp.permission} to ${rp.role}`);
      }
    }

    // 5. Create test users for each role
    console.log('\nCreating test users for each role...');
    
    const testUsers = [
      {
        email: 'admin@day1main.com',
        password: 'admin123',
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+27123456789',
        role: 'system_admin',
      },
      {
        email: 'member@day1main.com',
        password: 'member123',
        firstName: 'John',
        lastName: 'Member',
        phone: '+27123456790',
        role: 'member',
      },
      {
        email: 'broker@day1main.com',
        password: 'broker123',
        firstName: 'Sarah',
        lastName: 'Broker',
        phone: '+27123456791',
        role: 'broker',
      },
      {
        email: 'assessor@day1main.com',
        password: 'assessor123',
        firstName: 'Mike',
        lastName: 'Assessor',
        phone: '+27123456792',
        role: 'claims_assessor',
      },
      {
        email: 'compliance@day1main.com',
        password: 'compliance123',
        firstName: 'Lisa',
        lastName: 'Compliance',
        phone: '+27123456793',
        role: 'compliance_officer',
      },
      {
        email: 'finance@day1main.com',
        password: 'finance123',
        firstName: 'David',
        lastName: 'Finance',
        phone: '+27123456794',
        role: 'finance_manager',
      },
    ];

    for (const testUser of testUsers) {
      const passwordHash = await bcrypt.hash(testUser.password, 10);
      
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', testUser.email)
        .single();

      let userId;
      
      if (existingUser) {
        console.log(`✓ User already exists: ${testUser.email}`);
        userId = existingUser.id;
      } else {
        const { data: user, error: userError } = await supabase
          .from('users')
          .insert({
            email: testUser.email,
            password_hash: passwordHash,
            is_active: true,
            email_verified: true,
          })
          .select()
          .single();

        if (userError) {
          console.error(`Error creating user ${testUser.email}:`, userError.message);
          continue;
        }

        userId = user.id;
        console.log(`✓ Created user: ${testUser.email}`);

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            first_name: testUser.firstName,
            last_name: testUser.lastName,
            phone: testUser.phone,
          });

        if (profileError) {
          console.error(`Error creating profile for ${testUser.email}:`, profileError.message);
        } else {
          console.log(`  ✓ Created profile for ${testUser.firstName} ${testUser.lastName}`);
        }
      }

      // Assign role
      const roleId = roleMap.get(testUser.role);
      if (roleId) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role_id: roleId,
          }, { onConflict: 'user_id,role_id' });

        if (roleError) {
          console.error(`Error assigning ${testUser.role} role:`, roleError.message);
        } else {
          console.log(`  ✓ Assigned ${testUser.role} role`);
        }
      }
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📋 Test Users Created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Role                 | Email                      | Password');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('System Admin         | admin@day1main.com         | admin123');
    console.log('Member               | member@day1main.com        | member123');
    console.log('Broker               | broker@day1main.com        | broker123');
    console.log('Claims Assessor      | assessor@day1main.com      | assessor123');
    console.log('Compliance Officer   | compliance@day1main.com    | compliance123');
    console.log('Finance Manager      | finance@day1main.com       | finance123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
