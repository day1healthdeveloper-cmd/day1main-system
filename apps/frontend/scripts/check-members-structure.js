const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMembersStructure() {
  console.log('🔍 Checking members table structure...\n');

  // Get a sample member to see all columns
  const { data: member } = await supabase
    .from('members')
    .select('*')
    .limit(1)
    .single();

  console.log('📋 Members table columns:\n');
  Object.keys(member).forEach(key => {
    const value = member[key];
    const type = value === null ? 'null' : typeof value;
    console.log(`   ${key}: ${type} = ${value === null ? 'NULL' : (typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value)}`);
  });

  // Check relevant columns for policy linking
  console.log('\n\n🔗 Policy-related columns:\n');
  const { data: sample } = await supabase
    .from('members')
    .select('id, member_number, first_name, last_name, policy_id, plan_name, plan_id')
    .limit(5);

  sample.forEach(m => {
    console.log(`   ${m.member_number} - ${m.first_name} ${m.last_name}`);
    console.log(`      policy_id: ${m.policy_id || 'NULL'}`);
    console.log(`      plan_name: ${m.plan_name || 'NULL'}`);
    console.log(`      plan_id: ${m.plan_id || 'NULL'}`);
    console.log('');
  });

  // Count members by plan_name
  console.log('\n📊 Members by plan_name:\n');
  const { data: allMembers } = await supabase
    .from('members')
    .select('plan_name')
    .eq('status', 'active');

  const planCounts = {};
  allMembers.forEach(m => {
    const plan = m.plan_name || 'NO PLAN';
    planCounts[plan] = (planCounts[plan] || 0) + 1;
  });

  Object.entries(planCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([plan, count]) => {
      console.log(`   ${plan}: ${count} members`);
    });
}

checkMembersStructure().catch(console.error);
