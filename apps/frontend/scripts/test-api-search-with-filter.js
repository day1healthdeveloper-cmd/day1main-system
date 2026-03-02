const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSearchWithPlanFilter() {
  console.log('🔍 Testing search WITH plan filter (new logic):\n');
  
  const search = 'giselle';
  const plan = 'DAY1 VALUE PLAN';
  
  // Simulate the new API logic
  let query = supabase
    .from('members')
    .select('*, brokers(code, name)', { count: 'exact' })
    .order('created_at', { ascending: false });
  
  // If search is provided, prioritize search
  if (search) {
    query = query.or(`member_number.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    // Don't apply plan filter when searching
  }
  
  const { data: members, error, count } = await query;
  
  console.log(`Search term: "${search}"`);
  console.log(`Plan filter: "${plan}" (IGNORED during search)`);
  console.log(`\nResults: ${members?.length || 0} members found\n`);
  
  if (members && members.length > 0) {
    members.forEach(m => {
      console.log(`✅ ${m.member_number}: ${m.first_name} ${m.last_name}`);
      console.log(`   Email: ${m.email}`);
      console.log(`   Plan: ${m.plan_name || 'No Plan Assigned'}`);
      console.log(`   Broker: ${m.broker_code} - ${m.brokers?.name || 'N/A'}`);
      console.log('');
    });
  }
}

testSearchWithPlanFilter().catch(console.error);
