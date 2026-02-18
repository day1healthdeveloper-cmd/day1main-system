require('dotenv').config({ path: './apps/backend/.env' });
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
      console.log('Roles:', existingUser.roles);
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
        first_name: 'Operations',
        last_name: 'Manager',
        roles: ['operations_manager'],
        is_active: true,
        email_verified: true,
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return;
    }

    console.log('✅ Operations Manager user created successfully!');
    console.log('Email: operations@day1main.com');
    console.log('Password: operations123');
    console.log('User ID:', newUser.id);
    console.log('Roles:', newUser.roles);

  } catch (error) {
    console.error('Error:', error);
  }
}

createOperationsUser();
