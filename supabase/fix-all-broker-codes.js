const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Official broker code mapping
const BROKER_MAPPING = {
  'DAY1': 'Day1Health Direct',
  'PAR': 'Parabellum',
  'MAM': 'Mamela',
  'ACU': 'Acumen Holdings',
  'AIB': 'Assurity Insurance Broker',
  'ARC': 'ARC BPO',
  'AXS': 'Accsure',
  'BOU': 'Boulderson',
  'BPO': 'Agency BPO',
  'CSS': 'CSS Credit Solutions Services',
  'MED': 'Medi-Safu Brokers',
  'MBM': 'Medi-Safu Brokers Montana',
  'MKT': 'MKT Marketing',
  'MTS': 'All My T',
  'NAV': 'Day1 Navigator',
  'RCO': 'Right Cover Online',
  'TFG': 'The Foschini Group',
  'THR': '360 Financial Service',
  'TLD': 'Teledirect',
  'ZWH': 'ZWH'
};

async function fixAllBrokerCodes() {
  console.log('🔧 Starting broker_code correction for all members...\n');
  
  // Get ALL members
  let allMembers = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data: members, error } = await supabase
      .from('members')
      .select('id, member_number, first_name, last_name, broker_code')
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
  
  console.log(`✅ Fetched ${allMembers.length} members\n`);
  
  // Identify members needing fixes
  const updates = [];
  
  allMembers.forEach(m => {
    // Special handling for DAY1 format (7 digits)
    if (/^DAY1\d{7}$/.test(m.member_number)) {
      if (!m.broker_code || m.broker_code !== 'DAY1') {
        updates.push({
          id: m.id,
          member_number: m.member_number,
          name: `${m.first_name} ${m.last_name}`,
          old_broker: m.broker_code || 'NULL',
          new_broker: 'DAY1'
        });
      }
      return;
    }
    
    // Extract prefix from member_number
    const prefix = m.member_number.match(/^[A-Z]+/)?.[0];
    
    // Check if prefix is recognized
    if (!prefix || !BROKER_MAPPING[prefix]) {
      return; // Skip unknown prefixes
    }
    
    // Check if broker_code needs updating
    if (!m.broker_code || m.broker_code !== prefix) {
      updates.push({
        id: m.id,
        member_number: m.member_number,
        name: `${m.first_name} ${m.last_name}`,
        old_broker: m.broker_code || 'NULL',
        new_broker: prefix
      });
    }
  });
  
  console.log(`📊 Found ${updates.length} members needing broker_code correction\n`);
  
  if (updates.length === 0) {
    console.log('✅ All broker codes are already correct!');
    return;
  }
  
  // Group by broker for summary
  const byBroker = {};
  updates.forEach(u => {
    if (!byBroker[u.new_broker]) {
      byBroker[u.new_broker] = [];
    }
    byBroker[u.new_broker].push(u);
  });
  
  console.log('📋 Updates by broker:');
  Object.entries(byBroker)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([broker, members]) => {
      console.log(`   ${broker.padEnd(6)} : ${members.length.toString().padStart(4)} members`);
    });
  
  console.log('\n📝 First 10 updates:');
  updates.slice(0, 10).forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.member_number} | ${u.name}`);
    console.log(`     Old: ${u.old_broker} → New: ${u.new_broker}`);
  });
  
  console.log('\n🚀 Starting database updates...\n');
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (let i = 0; i < updates.length; i++) {
    const update = updates[i];
    
    const { error } = await supabase
      .from('members')
      .update({ broker_code: update.new_broker })
      .eq('id', update.id);
    
    if (error) {
      errorCount++;
      errors.push({ update, error: error.message });
      console.log(`❌ Error updating ${update.member_number}: ${error.message}`);
    } else {
      successCount++;
      if ((i + 1) % 100 === 0) {
        console.log(`✅ Progress: ${i + 1}/${updates.length} updated`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(70));
  console.log(`✅ Successfully updated: ${successCount} members`);
  console.log(`❌ Errors: ${errorCount} members`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    errors.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.update.member_number}: ${e.error}`);
    });
  }
  
  console.log('\n✅ Broker code correction complete!');
  console.log('📌 All broker filters should now work correctly');
}

fixAllBrokerCodes().catch(console.error);
