const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPoliciesTable() {
  // Try to get one policy to see structure
  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error or no policies exist:', error.message);
    console.log('\nTrying to insert a test policy to see required columns...');
    
    const { error: insertError } = await supabase
      .from('policies')
      .insert({
        policy_number: 'TEST-001'
      });
    
    console.log('Insert error:', insertError?.message);
    return;
  }

  if (data && data.length > 0) {
    console.log('POLICIES TABLE COLUMNS:\n');
    Object.keys(data[0]).forEach(col => {
      console.log(`  - ${col}: ${data[0][col]}`);
    });
  } else {
    console.log('No policies in table yet. Checking schema...');
  }
}

checkPoliciesTable().catch(console.error);
