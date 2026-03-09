const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findProperSequence() {
  console.log('🔍 Finding proper DAY1 sequence...\n');
  
  // Get ALL members with member_number starting with DAY1
  let allDay1Members = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data: members, error } = await supabase
      .from('members')
      .select('member_number, first_name, last_name, created_at, broker_code')
      .ilike('member_number', 'DAY1%')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Error:', error);
      return;
    }
    
    if (members.length === 0) {
      hasMore = false;
    } else {
      allDay1Members = allDay1Members.concat(members);
      page++;
    }
  }
  
  // Filter to only 6-digit sequences (DAY1XXXXXX format)
  const properFormat = allDay1Members
    .filter(m => /^DAY1\d{6}$/.test(m.member_number))
    .map(m => ({
      number: m.member_number,
      numeric: parseInt(m.member_number.replace('DAY1', '')),
      name: `${m.first_name} ${m.last_name}`,
      broker: m.broker_code || 'NO BROKER',
      created: m.created_at
    }))
    .sort((a, b) => b.numeric - a.numeric);
  
  console.log(`Members with proper DAY1XXXXXX format (6 digits): ${properFormat.length}\n`);
  
  if (properFormat.length > 0) {
    console.log('Top 20 highest DAY1XXXXXX members:');
    properFormat.slice(0, 20).forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.number} | ${m.name} | Broker: ${m.broker}`);
    });
    
    console.log('\n✅ HIGHEST proper DAY1 number:', properFormat[0].number);
    console.log('   Numeric value:', properFormat[0].numeric);
    console.log('   Next available: DAY1' + String(properFormat[0].numeric + 1).padStart(6, '0'));
  } else {
    console.log('❌ No members found with DAY1XXXXXX format!');
    console.log('   Suggested starting number: DAY1000001');
  }
  
  // Show members without broker (application funnel)
  const noBroker = allDay1Members.filter(m => !m.broker_code);
  console.log(`\n📊 Members without broker (application funnel): ${noBroker.length}`);
  
  // Show different length formats
  console.log('\n📏 Member number length distribution:');
  const lengths = {};
  allDay1Members.forEach(m => {
    const len = m.member_number.length;
    lengths[len] = (lengths[len] || 0) + 1;
  });
  Object.entries(lengths).sort((a, b) => b[1] - a[1]).forEach(([len, count]) => {
    console.log(`   Length ${len}: ${count} members`);
  });
}

findProperSequence().catch(console.error);
