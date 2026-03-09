const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Official broker code to broker name mapping
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
  'ZWH': 'ZWH' // Not in your list, might be old/invalid
};

async function validateBrokerAssignments() {
  console.log('🔍 Validating broker assignments...\n');
  
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
  
  console.log(`✅ Total members: ${allMembers.length}\n`);
  
  // Analyze mismatches
  const issues = {
    missingBroker: [],
    mismatchedBroker: [],
    unknownPrefix: [],
    correct: []
  };
  
  allMembers.forEach(m => {
    // Special handling for DAY1 format (7 digits)
    if (/^DAY1\d{7}$/.test(m.member_number)) {
      const brokerCode = m.broker_code;
      if (!brokerCode || brokerCode === 'NONE') {
        issues.missingBroker.push(m);
      } else if (brokerCode !== 'DAY1') {
        issues.mismatchedBroker.push(m);
      } else {
        issues.correct.push(m);
      }
      return;
    }
    
    const memberPrefix = m.member_number.match(/^[A-Z]+/)?.[0];
    const brokerCode = m.broker_code;
    
    // Check if prefix is recognized
    if (!memberPrefix || !BROKER_MAPPING[memberPrefix]) {
      issues.unknownPrefix.push(m);
      return;
    }
    
    // Check if broker is missing
    if (!brokerCode || brokerCode === 'NONE') {
      issues.missingBroker.push(m);
      return;
    }
    
    // Check if broker matches prefix
    if (memberPrefix !== brokerCode) {
      issues.mismatchedBroker.push(m);
      return;
    }
    
    issues.correct.push(m);
  });
  
  console.log('📊 VALIDATION RESULTS:\n');
  console.log(`✅ Correct assignments: ${issues.correct.length} members`);
  console.log(`⚠️  Missing broker: ${issues.missingBroker.length} members`);
  console.log(`⚠️  Mismatched broker: ${issues.mismatchedBroker.length} members`);
  console.log(`❌ Unknown prefix: ${issues.unknownPrefix.length} members`);
  
  // Show missing broker details
  if (issues.missingBroker.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('⚠️  MEMBERS WITH MISSING BROKER ASSIGNMENT');
    console.log('='.repeat(70));
    
    const byPrefix = {};
    issues.missingBroker.forEach(m => {
      const prefix = m.member_number.match(/^[A-Z]+/)?.[0];
      if (!byPrefix[prefix]) byPrefix[prefix] = [];
      byPrefix[prefix].push(m);
    });
    
    Object.entries(byPrefix).forEach(([prefix, members]) => {
      console.log(`\n${prefix} (${members.length} members) - Should be broker: ${prefix}`);
      console.log(`   Broker name: ${BROKER_MAPPING[prefix]}`);
      members.slice(0, 3).forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name} | Broker: ${m.broker_code || 'NULL'}`);
      });
      if (members.length > 3) {
        console.log(`   ... and ${members.length - 3} more`);
      }
    });
  }
  
  // Show mismatched broker details
  if (issues.mismatchedBroker.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('⚠️  MEMBERS WITH MISMATCHED BROKER');
    console.log('='.repeat(70));
    
    issues.mismatchedBroker.slice(0, 20).forEach((m, i) => {
      const prefix = m.member_number.match(/^[A-Z]+/)?.[0];
      console.log(`${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name}`);
      console.log(`   Current broker: ${m.broker_code} | Should be: ${prefix}`);
    });
    if (issues.mismatchedBroker.length > 20) {
      console.log(`... and ${issues.mismatchedBroker.length - 20} more`);
    }
  }
  
  // Show unknown prefix details
  if (issues.unknownPrefix.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('❌ MEMBERS WITH UNKNOWN PREFIX');
    console.log('='.repeat(70));
    
    issues.unknownPrefix.slice(0, 10).forEach((m, i) => {
      const prefix = m.member_number.match(/^[A-Z]+/)?.[0] || 'NONE';
      console.log(`${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name} | Broker: ${m.broker_code || 'NULL'}`);
    });
  }
  
  // Summary and recommendations
  console.log('\n' + '='.repeat(70));
  console.log('💡 RECOMMENDATIONS');
  console.log('='.repeat(70));
  
  const totalIssues = issues.missingBroker.length + issues.mismatchedBroker.length;
  
  if (totalIssues > 0) {
    console.log(`\n${totalIssues} members need broker code corrections:`);
    console.log(`   - ${issues.missingBroker.length} members missing broker assignment`);
    console.log(`   - ${issues.mismatchedBroker.length} members with wrong broker code`);
    console.log('\nWould you like to:');
    console.log('   1. Auto-fix: Set broker_code to match member_number prefix');
    console.log('   2. Review manually before fixing');
  } else {
    console.log('\n✅ All broker assignments are correct!');
  }
  
  if (issues.unknownPrefix.length > 0) {
    console.log(`\n⚠️  ${issues.unknownPrefix.length} members have unknown prefixes`);
    console.log('   These may need manual review or conversion to DAY1 format');
  }
}

validateBrokerAssignments().catch(console.error);
