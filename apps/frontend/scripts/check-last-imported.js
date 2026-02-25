const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLastImported() {
  // Check for PAR members (Parabellum - the last broker in the batch)
  const { data: parMembers, error } = await supabase
    .from('members')
    .select('member_number, first_name, last_name, created_at')
    .like('member_number', 'PAR%')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`\nLast 10 PAR members imported:`);
    parMembers.forEach(m => {
      console.log(`  ${m.member_number} - ${m.first_name} ${m.last_name}`);
    });
  }
  
  // Check total count by broker
  const brokers = ['MBM', 'MKT', 'AXS', 'NAV', 'PAR'];
  console.log('\n=== Member counts by broker ===');
  for (const broker of brokers) {
    const { count } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('broker_code', broker);
    console.log(`${broker}: ${count} members`);
  }
}

checkLastImported()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
