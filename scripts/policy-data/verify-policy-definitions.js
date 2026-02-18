/**
 * Verify Policy Definitions Table
 * Run: node verify-policy-definitions.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

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
