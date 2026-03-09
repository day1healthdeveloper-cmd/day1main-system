const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMemberStatusCounts() {
  console.log('🔍 Checking actual member status counts...\n');
  
  // Get total count
  const { count: totalCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true });
  
  console.log(`Total members: ${totalCount}\n`);
  
  // Get counts by status
  const statuses = ['active', 'pending', 'suspended', 'cancelled', 'in_waiting'];
  
  console.log('Counts by status:');
  for (const status of statuses) {
    const { count } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    
    console.log(`  ${status.padEnd(15)}: ${count || 0}`);
  }
  
  // Check for any other status values
  const { data: allStatuses } = await supabase
    .from('members')
    .select('status')
    .not('status', 'in', `(${statuses.join(',')})`);
  
  if (allStatuses && allStatuses.length > 0) {
    const uniqueOtherStatuses = [...new Set(allStatuses.map(m => m.status))];
    console.log(`\n⚠️  Found ${allStatuses.length} members with other status values:`);
    uniqueOtherStatuses.forEach(status => {
      const count = allStatuses.filter(m => m.status === status).length;
      console.log(`  ${status || 'NULL'}: ${count}`);
    });
  }
  
  // Verify total
  const { count: verifyTotal } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n✅ Verification: Total = ${verifyTotal}`);
}

checkMemberStatusCounts().catch(console.error);
