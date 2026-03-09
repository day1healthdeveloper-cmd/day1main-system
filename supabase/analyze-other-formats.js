const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeOtherFormats() {
  console.log('🔍 Analyzing "Other" member number formats...\n');
  
  // Get ALL members
  let allMembers = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data: members, error } = await supabase
      .from('members')
      .select('id, member_number, first_name, last_name, broker_code, created_at')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('❌ Error fetching members:', error);
      return;
    }
    
    if (members.length === 0) {
      hasMore = false;
    } else {
      allMembers = allMembers.concat(members);
      page++;
    }
  }
  
  // Filter to "Other" category
  const otherMembers = allMembers.filter(m => {
    const num = m.member_number;
    return !(
      (num.startsWith('DAY1') && /^DAY1\d{7}$/.test(num)) ||
      num.startsWith('MEM-') ||
      num.startsWith('BPC') ||
      num.startsWith('MED') ||
      num.startsWith('PAR') ||
      num.startsWith('THR')
    );
  });
  
  console.log(`Total "Other" members: ${otherMembers.length}\n`);
  
  // Group by prefix (first 3-4 characters)
  const prefixes = {};
  otherMembers.forEach(m => {
    const prefix = m.member_number.match(/^[A-Z]+/)?.[0] || 'UNKNOWN';
    if (!prefixes[prefix]) {
      prefixes[prefix] = [];
    }
    prefixes[prefix].push(m);
  });
  
  console.log('📊 Breakdown by prefix:\n');
  Object.entries(prefixes)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([prefix, members]) => {
      console.log(`${prefix.padEnd(10)} : ${members.length.toString().padStart(4)} members`);
    });
  
  console.log('\n' + '='.repeat(70));
  console.log('📋 DETAILED BREAKDOWN');
  console.log('='.repeat(70));
  
  Object.entries(prefixes)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([prefix, members]) => {
      console.log(`\n${prefix} (${members.length} members):`);
      console.log('   Examples:');
      members.slice(0, 5).forEach((m, i) => {
        console.log(`     ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name} | Broker: ${m.broker_code || 'NONE'}`);
      });
      
      // Show broker distribution
      const brokers = {};
      members.forEach(m => {
        const broker = m.broker_code || 'NONE';
        brokers[broker] = (brokers[broker] || 0) + 1;
      });
      console.log('   Brokers:', Object.entries(brokers).map(([b, c]) => `${b}(${c})`).join(', '));
    });
  
  console.log('\n' + '='.repeat(70));
  console.log('💡 RECOMMENDATIONS');
  console.log('='.repeat(70));
  
  console.log('\nThese appear to be broker-specific member numbers:');
  Object.entries(prefixes).forEach(([prefix, members]) => {
    const mainBroker = members[0].broker_code;
    if (mainBroker && mainBroker !== 'NONE') {
      console.log(`   ${prefix}: ${members.length} members (Broker: ${mainBroker})`);
      console.log(`      → These are likely assigned by broker "${mainBroker}"`);
      console.log(`      → Should we keep these or convert to DAY1 format?`);
    } else {
      console.log(`   ${prefix}: ${members.length} members (No broker assigned)`);
      console.log(`      → These should probably be converted to DAY1 format`);
    }
  });
}

analyzeOtherFormats().catch(console.error);
