const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkThrMembers() {
  console.log('🔍 Checking THR (360 Financial Service) members...\n');
  
  // Check by member_number prefix
  const { data: thrNumberMembers, error: error1 } = await supabase
    .from('members')
    .select('id, member_number, first_name, last_name, broker_code, created_at')
    .ilike('member_number', 'THR%');
  
  if (error1) {
    console.error('❌ Error:', error1);
    return;
  }
  
  console.log(`📊 Members with member_number starting with 'THR': ${thrNumberMembers?.length || 0}`);
  if (thrNumberMembers && thrNumberMembers.length > 0) {
    thrNumberMembers.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name} | Broker: ${m.broker_code || 'NULL'}`);
    });
  }
  
  // Check by broker_code
  const { data: thrBrokerMembers, error: error2 } = await supabase
    .from('members')
    .select('id, member_number, first_name, last_name, broker_code, created_at')
    .eq('broker_code', 'THR');
  
  if (error2) {
    console.error('❌ Error:', error2);
    return;
  }
  
  console.log(`\n📊 Members with broker_code = 'THR': ${thrBrokerMembers?.length || 0}`);
  if (thrBrokerMembers && thrBrokerMembers.length > 0) {
    thrBrokerMembers.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name} | Broker: ${m.broker_code}`);
    });
  }
  
  // Check for variations
  const { data: thrVariations, error: error3 } = await supabase
    .from('members')
    .select('id, member_number, first_name, last_name, broker_code, created_at')
    .or('broker_code.ilike.%360%,broker_code.ilike.%financial%');
  
  if (error3) {
    console.error('❌ Error:', error3);
    return;
  }
  
  console.log(`\n📊 Members with broker_code containing '360' or 'financial': ${thrVariations?.length || 0}`);
  if (thrVariations && thrVariations.length > 0) {
    thrVariations.slice(0, 10).forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name} | Broker: ${m.broker_code || 'NULL'}`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('💡 ANALYSIS');
  console.log('='.repeat(70));
  
  if (thrNumberMembers && thrNumberMembers.length > 0) {
    const needsBrokerFix = thrNumberMembers.filter(m => m.broker_code !== 'THR');
    if (needsBrokerFix.length > 0) {
      console.log(`\n⚠️  ${needsBrokerFix.length} THR members need broker_code updated to 'THR'`);
    } else {
      console.log('\n✅ All THR members have correct broker_code');
    }
  } else {
    console.log('\n⚠️  No members found with THR prefix');
  }
}

checkThrMembers().catch(console.error);
