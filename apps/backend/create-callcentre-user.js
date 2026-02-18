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

async function createCallCentreUser() {
  try {
    console.log('Creating Call Centre Agent user...');

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'callcentre@day1main.com')
      .single();

    if (existingUser) {
      console.log('Call Centre user already exists:', existingUser.email);
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
    const hashedPassword = await bcrypt.hash('callcentre123', 10);

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: 'callcentre@day1main.com',
        password_hash: hashedPassword,
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return;
    }

    console.log('✅ User created:', newUser.email);

    // Get call_centre_agent role ID
    const { data: role } = await supabase
      .from('roles')
      .select('id, name')
      .eq('name', 'call_centre_agent')
      .single();

    if (!role) {
      console.log('❌ call_centre_agent role not found in database');
      console.log('Creating role...');
      
      // Create the role
      const { data: newRole, error: roleCreateError } = await supabase
        .from('roles')
        .insert({
          name: 'call_centre_agent',
          description: 'Call centre agent for customer support',
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

    console.log('✅ Call Centre Agent user created successfully!');
    console.log('Email: callcentre@day1main.com');
    console.log('Password: callcentre123');
    console.log('User ID:', newUser.id);

  } catch (error) {
    console.error('Error:', error);
  }
}

createCallCentreUser();
