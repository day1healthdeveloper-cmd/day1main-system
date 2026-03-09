const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkParMembers() {
  console.log('🔍 Checking PAR (Parabellum) members...\n');
  
  // Get members with PAR prefix
  const { data: parMembers, error } = await supabase
    .from('members')
    .select('id, member_number, first_name, last_name, broker_code, created_at')
    .ilike('member_number', 'PAR%')
    .order('member_number', { ascending: false });
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`📊 Total members with PAR prefix: ${parMembers.length}\n`);
  
  // Group by broker_code
  const byBroker = {};
  parMembers.forEach(m => {
    const broker = m.broker_code || 'NULL';
    if (!byBroker[broker]) {
      byBroker[broker] = [];
    }
    byBroker[broker].push(m);
  });
  
  console.log('Breakdown by broker_code:\n');
  Object.entries(byBroker)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([broker, members]) => {
      console.log(`${broker.padEnd(10)} : ${members.length.toString().padStart(4)} members`);
    });
  
  console.log('\n' + '='.repeat(70));
  console.log('📋 EXAMPLES');
  console.log('='.repeat(70));
  
  Object.entries(byBroker).forEach(([broker, members]) => {
    console.log(`\nBroker: ${broker} (${members.length} members)`);
    members.slice(0, 5).forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name}`);
    });
    if (members.length > 5) {
      console.log(`  ... and ${members.length - 5} more`);
    }
  });
  
  // Check for correct assignments
  const correct = parMembers.filter(m => m.broker_code === 'PAR');
  const incorrect = parMembers.filter(m => m.broker_code !== 'PAR');
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total PAR members: ${parMembers.length}`);
  console.log(`✅ Correct (broker_code = PAR): ${correct.length}`);
  console.log(`⚠️  Incorrect (broker_code ≠ PAR): ${incorrect.length}`);
  
  if (incorrect.length > 0) {
    console.log('\n⚠️  Members needing correction:');
    incorrect.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name} | Current broker: ${m.broker_code || 'NULL'}`);
    });
  }
}

checkParMembers().catch(console.error);
