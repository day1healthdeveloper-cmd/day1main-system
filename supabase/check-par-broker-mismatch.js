const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkParBrokerMismatch() {
  console.log('🔍 Checking for PAR broker code mismatches...\n');
  
  // Get members with broker_code = 'PAR'
  const { data: parBrokerMembers, error: error1 } = await supabase
    .from('members')
    .select('id, member_number, first_name, last_name, broker_code, created_at')
    .eq('broker_code', 'PAR')
    .order('member_number', { ascending: false });
  
  if (error1) {
    console.error('❌ Error:', error1);
    return;
  }
  
  console.log(`📊 Total members with broker_code = 'PAR': ${parBrokerMembers.length}\n`);
  
  // Get members with member_number starting with PAR
  const { data: parNumberMembers, error: error2 } = await supabase
    .from('members')
    .select('id, member_number, first_name, last_name, broker_code, created_at')
    .ilike('member_number', 'PAR%')
    .order('member_number', { ascending: false });
  
  if (error2) {
    console.error('❌ Error:', error2);
    return;
  }
  
  console.log(`📊 Total members with member_number starting with 'PAR': ${parNumberMembers.length}\n`);
  
  // Find members with broker_code = PAR but member_number NOT starting with PAR
  const brokerParButNotNumberPar = parBrokerMembers.filter(m => !m.member_number.startsWith('PAR'));
  
  // Find members with member_number starting with PAR but broker_code NOT PAR
  const numberParButNotBrokerPar = parNumberMembers.filter(m => m.broker_code !== 'PAR');
  
  console.log('='.repeat(70));
  console.log('📋 ANALYSIS');
  console.log('='.repeat(70));
  
  if (brokerParButNotNumberPar.length > 0) {
    console.log(`\n⚠️  ${brokerParButNotNumberPar.length} members have broker_code='PAR' but member_number does NOT start with PAR:`);
    brokerParButNotNumberPar.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name} | Broker: ${m.broker_code}`);
    });
  } else {
    console.log('\n✅ All members with broker_code=PAR have member_number starting with PAR');
  }
  
  if (numberParButNotBrokerPar.length > 0) {
    console.log(`\n⚠️  ${numberParButNotBrokerPar.length} members have member_number starting with PAR but broker_code is NOT 'PAR':`);
    numberParButNotBrokerPar.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name} | Broker: ${m.broker_code || 'NULL'}`);
    });
  } else {
    console.log('\n✅ All members with member_number starting with PAR have broker_code=PAR');
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📌 SUMMARY');
  console.log('='.repeat(70));
  console.log(`Members with broker_code='PAR': ${parBrokerMembers.length}`);
  console.log(`Members with member_number='PAR%': ${parNumberMembers.length}`);
  console.log(`Difference: ${Math.abs(parBrokerMembers.length - parNumberMembers.length)}`);
  
  if (parBrokerMembers.length === parNumberMembers.length && 
      brokerParButNotNumberPar.length === 0 && 
      numberParButNotBrokerPar.length === 0) {
    console.log('\n✅ Perfect match! All PAR members are correctly configured.');
  } else {
    console.log('\n⚠️  There are mismatches that need to be fixed.');
  }
}

checkParBrokerMismatch().catch(console.error);
