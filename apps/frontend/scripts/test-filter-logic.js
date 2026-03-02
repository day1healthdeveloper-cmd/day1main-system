const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testFilterLogic() {
  console.log('🧪 Testing filter combinations:\n');
  
  // Test 1: Plan filter ONLY (no search)
  console.log('1. Plan filter: "DAY1 VALUE PLUS PLAN" (no search)');
  let query1 = supabase
    .from('members')
    .select('member_number, first_name, last_name, plan_name')
    .eq('plan_name', 'DAY1 VALUE PLUS PLAN')
    .limit(5);
  
  const { data: test1 } = await query1;
  console.log(`   Found: ${test1?.length || 0} members`);
  if (test1) {
    test1.forEach(m => console.log(`   - ${m.member_number}: ${m.first_name} ${m.last_name} (${m.plan_name})`));
  }
  
  // Test 2: Search ONLY (no filters)
  console.log('\n2. Search: "gis" (no filters)');
  let query2 = supabase
    .from('members')
    .select('member_number, first_name, last_name, plan_name')
    .or(`member_number.ilike.%gis%,first_name.ilike.%gis%,last_name.ilike.%gis%,email.ilike.%gis%`)
    .limit(10);
  
  const { data: test2 } = await query2;
  console.log(`   Found: ${test2?.length || 0} members`);
  if (test2) {
    test2.forEach(m => console.log(`   - ${m.member_number}: ${m.first_name} ${m.last_name} (${m.plan_name || 'No Plan'})`));
  }
  
  // Test 3: Plan filter + Search (should search WITHIN filtered plan)
  console.log('\n3. Plan filter: "DAY1 VALUE PLUS PLAN" + Search: "gis"');
  let query3 = supabase
    .from('members')
    .select('member_number, first_name, last_name, plan_name')
    .eq('plan_name', 'DAY1 VALUE PLUS PLAN')
    .or(`member_number.ilike.%gis%,first_name.ilike.%gis%,last_name.ilike.%gis%,email.ilike.%gis%`);
  
  const { data: test3 } = await query3;
  console.log(`   Found: ${test3?.length || 0} members`);
  if (test3) {
    test3.forEach(m => console.log(`   - ${m.member_number}: ${m.first_name} ${m.last_name} (${m.plan_name})`));
  }
  
  console.log('\n✅ Expected behavior:');
  console.log('   - Test 1: Should show only DAY1 VALUE PLUS PLAN members');
  console.log('   - Test 2: Should show all members matching "gis" regardless of plan');
  console.log('   - Test 3: Should show only members with DAY1 VALUE PLUS PLAN that match "gis"');
}

testFilterLogic().catch(console.error);
