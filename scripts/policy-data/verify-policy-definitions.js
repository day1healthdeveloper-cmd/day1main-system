/**
 * Verify Policy Definitions Table
 * Run: node verify-policy-definitions.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!supabaseUrl) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY");

async function verify() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🔍 Checking policy_definitions table...\n');
  
  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('policy_definitions')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Table does NOT exist or is not accessible');
      console.log('Error:', error.message);
      console.log('\n📋 You need to run the SQL manually:');
      console.log('1. Open https://supabase.com/dashboard/project/ldygmpaipxbokxzyzyti/sql/new');
      console.log('2. Copy contents of RUN_THIS_IN_SUPABASE.sql');
      console.log('3. Paste and click RUN\n');
      return false;
    }
    
    console.log('✅ Table EXISTS and is accessible!');
    console.log(`📊 Current records: ${data.length}\n`);
    
    if (data.length > 0) {
      console.log('Sample definitions:');
      data.forEach(def => {
        console.log(`  - ${def.term} (${def.category})`);
      });
    } else {
      console.log('No definitions yet - ready to add them!');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

verify();
