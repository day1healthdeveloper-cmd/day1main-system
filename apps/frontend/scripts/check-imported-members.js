const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMembers() {
  const { data, error } = await supabase
    .from('members')
    .select('member_number, first_name, last_name, broker_code, broker_id')
    .like('member_number', 'ZWH%')
    .order('member_number');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Found ${data.length} members with ZWH prefix:\n`);
    data.forEach(m => {
      console.log(`${m.member_number} - ${m.first_name} ${m.last_name} - Broker: ${m.broker_code || 'NULL'} (ID: ${m.broker_id || 'NULL'})`);
    });
  }
  
  // Check what broker ZWH should map to
  console.log('\n\nChecking brokers table for ZWH or similar:');
  const { data: brokers } = await supabase
    .from('brokers')
    .select('code, name, policy_prefix')
    .or('policy_prefix.ilike.%ZWH%,code.ilike.%ZWH%,name.ilike.%assurity%');
  
  if (brokers && brokers.length > 0) {
    brokers.forEach(b => {
      console.log(`${b.code} - ${b.name} - prefix: ${b.policy_prefix}`);
    });
  } else {
    console.log('No broker found with ZWH prefix or Assurity name');
  }
}

checkMembers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
