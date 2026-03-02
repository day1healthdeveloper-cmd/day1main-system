const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSearch() {
  const searchTerm = 'giselle';
  
  console.log(`🔍 Testing search for: "${searchTerm}"\n`);
  
  // This is what the API does
  const { data: members, error } = await supabase
    .from('members')
    .select('*, brokers(code, name)')
    .or(`member_number.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${members.length} members:\n`);
  members.forEach(m => {
    console.log(`Member Number: ${m.member_number}`);
    console.log(`Name: ${m.first_name} ${m.last_name}`);
    console.log(`Email: ${m.email}`);
    console.log(`Broker: ${m.broker_code} - ${m.brokers?.name || 'N/A'}`);
    console.log(`Plan: ${m.plan_name || 'No Plan'}`);
    console.log(`Status: ${m.status}`);
    console.log('---');
  });
}

testSearch().catch(console.error);
