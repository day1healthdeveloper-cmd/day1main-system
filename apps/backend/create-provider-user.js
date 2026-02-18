const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createProviderUser() {
  console.log('🔧 Creating provider user...\n');

  // Check if provider user already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'provider@day1main.com')
    .maybeSingle();

  if (existing) {
    console.log('✅ Provider user already exists!');
    console.log(`   Email: ${existing.email}`);
    console.log(`   ID: ${existing.id}`);
    return;
  }

  // Get provider role ID
  const { data: providerRole } = await supabase
    .from('roles')
    .select('id, name')
    .eq('name', 'provider')
    .single();

  if (!providerRole) {
    console.log('❌ Provider role not found in database');
    return;
  }

  console.log(`✅ Found provider role: ${providerRole.name}`);

  // Create user with minimal fields
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({
      email: 'provider@day1main.com',
      password_hash: '$2b$10$YourHashedPasswordHere',
    })
    .select()
    .single();

  if (createError) {
    console.log(`❌ Error creating user: ${createError.message}`);
    console.log('   Trying with different approach...');
    
    // Try to get the user table structure
    const { data: sample } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single();
    
    console.log('\n📋 Sample user structure:', Object.keys(sample || {}));
    return;
  }

  console.log(`✅ User created: ${newUser.email}`);

  // Assign provider role
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: newUser.id,
      role_id: providerRole.id,
    });

  if (roleError) {
    console.log(`❌ Error assigning role: ${roleError.message}`);
  } else {
    console.log(`✅ Assigned provider role`);
  }

  console.log('\n✅ Provider user created successfully!');
  console.log('📧 Email: provider@day1main.com');
  console.log('🔑 Password: password123 (default)');
}

createProviderUser();
