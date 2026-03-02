const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  console.log('🔌 Checking members table for plan data...\n');
  
  // Count ALL members
  const { count: totalCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true });

  console.log(`Total members: ${totalCount}\n`);

  // Count members WITH plan_name
  const { count: withPlanCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .not('plan_name', 'is', null);

  console.log(`Members with plan_name: ${withPlanCount}\n`);

  // Sample of members with plans
  const { data: sample } = await supabase
    .from('members')
    .select('member_number, plan_name, plan_id, monthly_premium')
    .not('plan_name', 'is', null)
    .limit(10);

  console.log('Sample of 10 members WITH plans:');
  sample.forEach(m => {
    console.log(`  ${m.member_number}: ${m.plan_name}`);
  });

  // Count VALUE PLUS plans specifically
  const { count: valuePlusCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .ilike('plan_name', '%VALUE PLUS%');

  console.log(`\n\n📊 VALUE PLUS MEMBERS: ${valuePlusCount}`);

  // Get breakdown of VALUE PLUS variants
  const { data: valuePlusMembers } = await supabase
    .from('members')
    .select('plan_name')
    .ilike('plan_name', '%VALUE PLUS%');

  const variants = {};
  valuePlusMembers.forEach(m => {
    variants[m.plan_name] = (variants[m.plan_name] || 0) + 1;
  });

  console.log('\nVALUE PLUS variants:');
  Object.entries(variants)
    .sort((a, b) => b[1] - a[1])
    .forEach(([plan, count]) => {
      console.log(`  ${count.toString().padStart(4)} - ${plan}`);
    });
}

testConnection().catch(console.error);
