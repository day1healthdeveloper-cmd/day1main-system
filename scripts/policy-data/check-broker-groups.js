const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBrokerGroups() {
  console.log('🔍 Checking broker groups in members table...\n');

  // Check if broker_group column exists and has data
  const { data: members, error } = await supabase
    .from('members')
    .select('broker_group, debit_order_status, monthly_premium, total_arrears')
    .limit(10);

  if (error) {
    console.error('❌ Error fetching members:', error);
    return;
  }

  console.log(`✅ Found ${members.length} members (showing first 10)`);
  console.log('\nSample data:');
  console.table(members);

  // Get unique broker groups
  const { data: allMembers, error: error2 } = await supabase
    .from('members')
    .select('broker_group');

  if (error2) {
    console.error('❌ Error fetching all members:', error2);
    return;
  }

  const uniqueGroups = [...new Set(allMembers.map(m => m.broker_group))].filter(Boolean);
  
  console.log(`\n📊 Unique broker groups found: ${uniqueGroups.length}`);
  console.log(uniqueGroups);

  // Count members per group
  console.log('\n👥 Members per group:');
  for (const group of uniqueGroups) {
    const count = allMembers.filter(m => m.broker_group === group).length;
    console.log(`  ${group}: ${count} members`);
  }
}

checkBrokerGroups();
