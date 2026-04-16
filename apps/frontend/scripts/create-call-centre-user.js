const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCallCentreUser() {
  try {
    console.log('🔄 Creating call centre user...');

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'callcentre@day1main.com',
      password: 'callcentre123',
      email_confirm: true,
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // 2. Create user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: 'callcentre@day1main.com',
        first_name: 'Call',
        last_name: 'Centre',
        is_active: true,
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ User error:', userError);
      return;
    }

    console.log('✅ User record created:', userData.id);

    // 3. Get call_centre_agent role
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'call_centre_agent')
      .single();

    if (roleError) {
      console.error('❌ Role not found:', roleError);
      return;
    }

    console.log('✅ Role found:', roleData.id);

    // 4. Assign role
    const { error: userRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userData.id,
        role_id: roleData.id,
      });

    if (userRoleError) {
      console.error('❌ User role error:', userRoleError);
      return;
    }

    console.log('✅ Call centre user created successfully!');
    console.log('📧 Email: callcentre@day1main.com');
    console.log('🔑 Password: callcentre123');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createCallCentreUser();
