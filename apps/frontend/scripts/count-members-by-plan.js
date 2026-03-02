const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function countMembersByPlan() {
  // Get ALL members, not just active
  const { data: allMembers, error } = await supabase
    .from('members')
    .select('plan_name, status');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total members in database: ${allMembers.length}`);
  
  // Count by status
  const statusCounts = {};
  allMembers.forEach(m => {
    statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
  });
  
  console.log('\nMembers by status:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  const planCounts = {};
  allMembers.forEach(m => {
    const plan = m.plan_name || 'NO PLAN';
    planCounts[plan] = (planCounts[plan] || 0) + 1;
  });

  console.log('\n\nMembers by plan_name:\n');
  Object.entries(planCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([plan, count]) => {
      console.log(`  ${plan}: ${count} members`);
    });

  // Check for Value Plus specifically
  console.log('\n\nValue Plus plans:');
  const valuePlusPlans = Object.entries(planCounts)
    .filter(([plan]) => plan.toLowerCase().includes('value plus'));
  
  if (valuePlusPlans.length > 0) {
    valuePlusPlans.forEach(([plan, count]) => {
      console.log(`  ${plan}: ${count} members`);
    });
  } else {
    console.log('  No members with "Value Plus" in plan_name');
  }
}

countMembersByPlan().catch(console.error);
