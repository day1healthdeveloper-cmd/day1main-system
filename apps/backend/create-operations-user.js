require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createOperationsUser() {
  try {
    console.log('Creating Operations Manager user...');

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'operations@day1main.com')
      .single();

    if (existingUser) {
      console.log('Operations Manager user already exists:', existingUser.email);
      console.log('User ID:', existingUser.id);
      
      // Check roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('roles (name)')
        .eq('user_id', existingUser.id);
      
      console.log('Roles:', userRoles?.map(ur => ur.roles.name).join(', '));
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('operations123', 10);

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: 'operations@day1main.com',
        password_hash: hashedPassword,
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return;
    }

    console.log('✅ User created:', newUser.email);

    // Get operations_manager role ID
    const { data: role } = await supabase
      .from('roles')
      .select('id, name')
      .eq('name', 'operations_manager')
      .single();

    if (!role) {
      console.log('❌ operations_manager role not found in database');
      console.log('Creating role...');
      
      // Create the role
      const { data: newRole, error: roleCreateError } = await supabase
        .from('roles')
        .insert({
          name: 'operations_manager',
          description: 'Operations manager for daily business operations',
        })
        .select()
        .single();
      
      if (roleCreateError) {
        console.error('Error creating role:', roleCreateError);
        return;
      }
      
      console.log('✅ Role created:', newRole.name);
      
      // Assign role to user
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: newUser.id,
          role_id: newRole.id,
        });

      if (assignError) {
        console.error('Error assigning role:', assignError);
        return;
      }
    } else {
      // Assign existing role to user
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: newUser.id,
          role_id: role.id,
        });

      if (assignError) {
        console.error('Error assigning role:', assignError);
        return;
      }
    }

    console.log('✅ Operations Manager user created successfully!');
    console.log('Email: operations@day1main.com');
    console.log('Password: operations123');
    console.log('User ID:', newUser.id);

  } catch (error) {
    console.error('Error:', error);
  }
}

createOperationsUser();
