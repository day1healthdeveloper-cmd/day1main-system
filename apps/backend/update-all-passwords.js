const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

const supabase = createClient(supabaseUrl, supabaseKey);

const userPasswords = {
  'admin@day1main.com': 'admin123',
  'assessor@day1main.com': 'assessor123',
  'broker@day1main.com': 'broker123',
  'compliance@day1main.com': 'compliance123',
  'finance@day1main.com': 'finance123',
  'marketing@day1main.com': 'marketing123',
  'member@day1main.com': 'member123',
  'provider@day1main.com': 'provider123',
};

async function updateAllPasswords() {
  console.log('🔧 Updating all user passwords...\n');

  for (const [email, password] of Object.entries(userPasswords)) {
    console.log(`📧 Processing ${email}...`);

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      console.log(`   ⚠️  User not found, skipping`);
      continue;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', user.id);

    if (updateError) {
      console.log(`   ❌ Error: ${updateError.message}`);
    } else {
      console.log(`   ✅ Password updated: ${password}`);
    }
  }

  console.log('\n✅ All passwords updated!');
  console.log('💡 You can now login with any of these credentials.');
}

updateAllPasswords();
