const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeAllMemberNumbers() {
  console.log('🔍 Analyzing ALL member numbers in database...\n');
  
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
  
  console.log(`✅ Total members in database: ${allMembers.length}\n`);
  
  // Categorize by prefix
  const categories = {
    'DAY1': [],
    'MEM-': [],
    'DAY17': [], // Old format
    'BPC': [],
    'MED': [],
    'PAR': [],
    'THR': [],
    'Other': []
  };
  
  allMembers.forEach(m => {
    const num = m.member_number;
    if (num.startsWith('DAY1') && /^DAY1\d{7}$/.test(num)) {
      categories['DAY1'].push(m);
    } else if (num.startsWith('MEM-')) {
      categories['MEM-'].push(m);
    } else if (num.startsWith('DAY17')) {
      categories['DAY17'].push(m);
    } else if (num.startsWith('BPC')) {
      categories['BPC'].push(m);
    } else if (num.startsWith('MED')) {
      categories['MED'].push(m);
    } else if (num.startsWith('PAR')) {
      categories['PAR'].push(m);
    } else if (num.startsWith('THR')) {
      categories['THR'].push(m);
    } else {
      categories['Other'].push(m);
    }
  });
  
  console.log('📊 Member Number Breakdown by Prefix:\n');
  Object.entries(categories).forEach(([prefix, members]) => {
    if (members.length > 0) {
      console.log(`${prefix.padEnd(10)} : ${members.length.toString().padStart(5)} members`);
    }
  });
  
  // Show examples of each category
  console.log('\n' + '='.repeat(70));
  console.log('📋 EXAMPLES FROM EACH CATEGORY');
  console.log('='.repeat(70));
  
  Object.entries(categories).forEach(([prefix, members]) => {
    if (members.length > 0) {
      console.log(`\n${prefix} (${members.length} members):`);
      members.slice(0, 5).forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name} | Broker: ${m.broker_code || 'NONE'}`);
      });
      if (members.length > 5) {
        console.log(`  ... and ${members.length - 5} more`);
      }
    }
  });
  
  // Analyze strange formats in detail
  console.log('\n' + '='.repeat(70));
  console.log('⚠️  POTENTIAL ISSUES');
  console.log('='.repeat(70));
  
  // Check MEM- format (should be converted to DAY1)
  if (categories['MEM-'].length > 0) {
    console.log(`\n⚠️  MEM- format: ${categories['MEM-'].length} members`);
    console.log('   These should be converted to DAY1 format');
    console.log('   Examples:');
    categories['MEM-'].slice(0, 3).forEach((m, i) => {
      console.log(`     ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name}`);
    });
  }
  
  // Check DAY17 format (old format, should be DAY1)
  if (categories['DAY17'].length > 0) {
    console.log(`\n⚠️  DAY17 format: ${categories['DAY17'].length} members`);
    console.log('   These appear to be old DAY1 format with extra digits');
    console.log('   Examples:');
    categories['DAY17'].slice(0, 3).forEach((m, i) => {
      console.log(`     ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name}`);
    });
  }
  
  // Check Other category
  if (categories['Other'].length > 0) {
    console.log(`\n⚠️  Other/Unknown format: ${categories['Other'].length} members`);
    console.log('   These have unusual formats');
    console.log('   Examples:');
    categories['Other'].slice(0, 10).forEach((m, i) => {
      console.log(`     ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name}`);
    });
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📌 SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Correct DAY1 format: ${categories['DAY1'].length} members`);
  
  const needsFixing = categories['MEM-'].length + categories['DAY17'].length + categories['Other'].length;
  if (needsFixing > 0) {
    console.log(`⚠️  Need attention: ${needsFixing} members`);
    console.log('   - MEM- format: ' + categories['MEM-'].length);
    console.log('   - DAY17 format: ' + categories['DAY17'].length);
    console.log('   - Other format: ' + categories['Other'].length);
  } else {
    console.log('✅ No issues found!');
  }
  
  // Check for broker-specific formats
  console.log('\n📊 Broker-specific formats (BPC, MED, PAR, THR):');
  ['BPC', 'MED', 'PAR', 'THR'].forEach(prefix => {
    if (categories[prefix].length > 0) {
      console.log(`   ${prefix}: ${categories[prefix].length} members (likely broker-assigned)`);
    }
  });
}

analyzeAllMemberNumbers().catch(console.error);
