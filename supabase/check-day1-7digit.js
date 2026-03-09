const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDay17Digit() {
  console.log('🔍 Checking DAY1 + 7 digit format...\n');
  
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
  
  // Filter to only 7-digit sequences (DAY1XXXXXXX format)
  const sevenDigit = allDay1Members
    .filter(m => /^DAY1\d{7}$/.test(m.member_number))
    .map(m => ({
      number: m.member_number,
      numeric: parseInt(m.member_number.replace('DAY1', '')),
      name: `${m.first_name} ${m.last_name}`,
      broker: m.broker_code || 'NO BROKER',
      created: m.created_at
    }))
    .sort((a, b) => b.numeric - a.numeric);
  
  console.log(`✅ Members with DAY1XXXXXXX format (7 digits): ${sevenDigit.length}\n`);
  
  if (sevenDigit.length > 0) {
    console.log('Top 20 highest DAY1XXXXXXX members:');
    sevenDigit.slice(0, 20).forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.number} | ${m.name} | Broker: ${m.broker}`);
    });
    
    console.log('\n✅ HIGHEST DAY1 7-digit number:', sevenDigit[0].number);
    console.log('   Numeric value:', sevenDigit[0].numeric);
    console.log('   Next available: DAY1' + String(sevenDigit[0].numeric + 1).padStart(7, '0'));
    
    // Show lowest
    console.log('\n📉 LOWEST DAY1 7-digit number:', sevenDigit[sevenDigit.length - 1].number);
    console.log('   Numeric value:', sevenDigit[sevenDigit.length - 1].numeric);
  } else {
    console.log('❌ No members found with DAY1XXXXXXX format!');
  }
  
  // Show all formats
  console.log('\n📊 All DAY1 format breakdown:');
  const formats = {
    '6-digit': allDay1Members.filter(m => /^DAY1\d{6}$/.test(m.member_number)).length,
    '7-digit': allDay1Members.filter(m => /^DAY1\d{7}$/.test(m.member_number)).length,
    '8-digit': allDay1Members.filter(m => /^DAY1\d{8}$/.test(m.member_number)).length,
    '9-digit': allDay1Members.filter(m => /^DAY1\d{9}$/.test(m.member_number)).length,
    '10-digit': allDay1Members.filter(m => /^DAY1\d{10}$/.test(m.member_number)).length,
    'with-letters': allDay1Members.filter(m => !/^DAY1\d+$/.test(m.member_number)).length,
    'other': allDay1Members.filter(m => /^DAY1\d+$/.test(m.member_number) && !/^DAY1\d{6,10}$/.test(m.member_number)).length
  };
  
  Object.entries(formats).forEach(([format, count]) => {
    if (count > 0) {
      console.log(`   ${format}: ${count} members`);
    }
  });
}

checkDay17Digit().catch(console.error);
