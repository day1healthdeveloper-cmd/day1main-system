const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeDay1Members() {
  console.log('🔍 Analyzing DAY1 member numbers...\n');
  
  // Get ALL members with member_number starting with DAY1
  let allDay1Members = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data: members, error } = await supabase
      .from('members')
      .select('member_number, first_name, last_name, created_at')
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
  
  console.log(`Total DAY1 members found: ${allDay1Members.length}\n`);
  
  // Analyze the formats
  const formats = {};
  const numericOnly = [];
  
  allDay1Members.forEach(m => {
    const withoutPrefix = m.member_number.replace('DAY1', '');
    
    // Check if it's purely numeric
    if (/^\d+$/.test(withoutPrefix)) {
      numericOnly.push({
        number: m.member_number,
        numeric: parseInt(withoutPrefix),
        name: `${m.first_name} ${m.last_name}`
      });
    } else {
      // Has letters
      const format = withoutPrefix.replace(/\d/g, '#');
      formats[format] = (formats[format] || 0) + 1;
    }
  });
  
  console.log('📊 Format Analysis:');
  console.log(`   Pure numeric (DAY1######): ${numericOnly.length}`);
  console.log(`   With letters: ${allDay1Members.length - numericOnly.length}\n`);
  
  if (Object.keys(formats).length > 0) {
    console.log('Letter formats found:');
    Object.entries(formats).forEach(([format, count]) => {
      console.log(`   ${format}: ${count} members`);
    });
    console.log('');
  }
  
  // Sort numeric ones and show highest
  if (numericOnly.length > 0) {
    numericOnly.sort((a, b) => b.numeric - a.numeric);
    
    console.log('Top 20 highest NUMERIC DAY1 member numbers:');
    numericOnly.slice(0, 20).forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.number} (${m.numeric}) | ${m.name}`);
    });
    
    console.log('\n✅ HIGHEST NUMERIC DAY1 member number:', numericOnly[0].number);
    console.log('   Numeric value:', numericOnly[0].numeric);
    console.log('   Next available: DAY1' + (numericOnly[0].numeric + 1));
  }
  
  // Show some examples of members with letters
  const withLetters = allDay1Members.filter(m => !/^DAY1\d+$/.test(m.member_number));
  if (withLetters.length > 0) {
    console.log('\n⚠️  Examples of members with LETTERS in number (first 10):');
    withLetters.slice(0, 10).forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name}`);
    });
  }
}

analyzeDay1Members().catch(console.error);
