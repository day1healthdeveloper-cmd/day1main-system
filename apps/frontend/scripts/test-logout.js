const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function testLogout() {
  console.log('🔍 Testing logout functionality...\n');

  // Check if there's a current session
  console.log('1. Checking for active sessions...');
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.log('❌ Error getting session:', error.message);
  } else if (session) {
    console.log('✅ Active session found:', session.user.email);
  } else {
    console.log('ℹ️  No active session');
  }

  console.log('\n2. Testing logout process...');
  console.log('   - Logout should clear localStorage');
  console.log('   - Logout should clear sessionStorage');
  console.log('   - Logout should call supabase.auth.signOut()');
  console.log('   - Logout should redirect to /login');

  console.log('\n3. Common logout issues:');
  console.log('   ❌ Button not clickable (z-index issue)');
  console.log('   ❌ onClick handler not firing');
  console.log('   ❌ Router.push not working');
  console.log('   ❌ Auth state not clearing');

  console.log('\n4. Debugging steps:');
  console.log('   1. Open browser console');
  console.log('   2. Click logout button');
  console.log('   3. Check for console.log messages');
  console.log('   4. Check if handleLogout is called');
  console.log('   5. Check if router.push is executed');
  console.log('   6. Check localStorage and sessionStorage');
}

testLogout().catch(console.error);
