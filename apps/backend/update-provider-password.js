const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateProviderPassword() {
  console.log('🔧 Updating provider password...\n');

  // Get provider user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'provider@day1main.com')
    .single();

  if (userError || !user) {
    console.log('❌ Provider user not found');
    return;
  }

  console.log(`✅ Found user: ${user.email}`);

  // Hash the password
  const password = 'provider123';
  const passwordHash = await bcrypt.hash(password, 10);

  console.log('🔐 Generated password hash');

  // Update password
  const { error: updateError } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', user.id);

  if (updateError) {
    console.log(`❌ Error updating password: ${updateError.message}`);
    return;
  }

  console.log('✅ Password updated successfully!');
  console.log('\n📧 Email: provider@day1main.com');
  console.log('🔑 Password: provider123');
}

updateProviderPassword();
