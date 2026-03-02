const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testFullSearch() {
  console.log('🔍 Testing different search scenarios:\n');
  
  // Test 1: Search "giselle" with NO filters
  console.log('1. Search "giselle" with NO filters:');
  const { data: test1 } = await supabase
    .from('members')
    .select('*, brokers(code, name)')
    .or(`member_number.ilike.%giselle%,first_name.ilike.%giselle%,last_name.ilike.%giselle%,email.ilike.%giselle%`);
  console.log(`   Found: ${test1?.length || 0} members`);
  if (test1 && test1.length > 0) {
    test1.forEach(m => console.log(`   - ${m.member_number}: ${m.first_name} ${m.last_name} (Plan: ${m.plan_name || 'None'})`));
  }
  
  // Test 2: Search "giselle" WITH plan filter "DAY1 VALUE PLAN"
  console.log('\n2. Search "giselle" WITH plan filter "DAY1 VALUE PLAN":');
  const { data: test2 } = await supabase
    .from('members')
    .select('*, brokers(code, name)')
    .eq('plan_name', 'DAY1 VALUE PLAN')
    .or(`member_number.ilike.%giselle%,first_name.ilike.%giselle%,last_name.ilike.%giselle%,email.ilike.%giselle%`);
  console.log(`   Found: ${test2?.length || 0} members`);
  
  // Test 3: Search by last name "gould"
  console.log('\n3. Search "gould":');
  const { data: test3 } = await supabase
    .from('members')
    .select('*, brokers(code, name)')
    .or(`member_number.ilike.%gould%,first_name.ilike.%gould%,last_name.ilike.%gould%,email.ilike.%gould%`);
  console.log(`   Found: ${test3?.length || 0} members`);
  if (test3 && test3.length > 0) {
    test3.forEach(m => console.log(`   - ${m.member_number}: ${m.first_name} ${m.last_name}`));
  }
  
  // Test 4: Search by member number "AIB1000793"
  console.log('\n4. Search "AIB1000793":');
  const { data: test4 } = await supabase
    .from('members')
    .select('*, brokers(code, name)')
    .or(`member_number.ilike.%AIB1000793%,first_name.ilike.%AIB1000793%,last_name.ilike.%AIB1000793%,email.ilike.%AIB1000793%`);
  console.log(`   Found: ${test4?.length || 0} members`);
  if (test4 && test4.length > 0) {
    test4.forEach(m => console.log(`   - ${m.member_number}: ${m.first_name} ${m.last_name}`));
  }
  
  // Test 5: Partial member number "AIB100"
  console.log('\n5. Search "AIB100":');
  const { data: test5 } = await supabase
    .from('members')
    .select('member_number, first_name, last_name')
    .or(`member_number.ilike.%AIB100%,first_name.ilike.%AIB100%,last_name.ilike.%AIB100%`)
    .limit(5);
  console.log(`   Found: ${test5?.length || 0} members`);
  if (test5 && test5.length > 0) {
    test5.forEach(m => console.log(`   - ${m.member_number}: ${m.first_name} ${m.last_name}`));
  }
}

testFullSearch().catch(console.error);
