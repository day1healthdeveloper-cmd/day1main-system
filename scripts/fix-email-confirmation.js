/**
 * Fix Email Confirmation for All Users
 * This script confirms all user emails in Supabase Auth
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function fixEmailConfirmation() {
  console.log('🔧 Fixing email confirmation for all users...\n');

  try {
    // Update all users to have confirmed emails
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/confirm_all_users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // If the function doesn't exist, try direct SQL via PostgREST
      console.log('⚠️  RPC function not found, trying alternative method...\n');
      
      // List all users first
      const usersResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!usersResponse.ok) {
        throw new Error(`Failed to fetch users: ${usersResponse.status} ${usersResponse.statusText}`);
      }

      const usersData = await usersResponse.json();
      const users = usersData.users || [];

      console.log(`📊 Found ${users.length} users\n`);

      // Update each user
      for (const user of users) {
        if (!user.email_confirmed_at) {
          console.log(`🔄 Confirming email for: ${user.email}`);
          
          const updateResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
            method: 'PUT',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email_confirm: true
            })
          });

          if (updateResponse.ok) {
            console.log(`   ✅ Confirmed: ${user.email}`);
          } else {
            console.log(`   ❌ Failed: ${user.email}`);
          }
        } else {
          console.log(`✓ Already confirmed: ${user.email}`);
        }
      }

      console.log('\n✅ All users processed!\n');
    } else {
      console.log('✅ All users confirmed via RPC!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nMake sure you have the correct service role key.\n');
    process.exit(1);
  }
}

fixEmailConfirmation();
