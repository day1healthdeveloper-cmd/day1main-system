const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDay1MemberNumbers() {
  console.log('🔧 Starting DAY1 member number standardization...\n');
  
  // Step 1: Get ALL DAY1 members
  console.log('📥 Fetching all DAY1 members...');
  let allDay1Members = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data: members, error } = await supabase
      .from('members')
      .select('id, member_number, first_name, last_name, created_at')
      .ilike('member_number', 'DAY1%')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('❌ Error fetching members:', error);
      return;
    }
    
    if (members.length === 0) {
      hasMore = false;
    } else {
      allDay1Members = allDay1Members.concat(members);
      page++;
    }
  }
  
  console.log(`✅ Fetched ${allDay1Members.length} DAY1 members\n`);
  
  // Step 2: Separate correct vs incorrect format
  const correct7Digit = allDay1Members.filter(m => /^DAY1\d{7}$/.test(m.member_number));
  const needsFixing = allDay1Members.filter(m => !/^DAY1\d{7}$/.test(m.member_number));
  
  console.log(`✅ Correct 7-digit format: ${correct7Digit.length} members`);
  console.log(`⚠️  Need fixing: ${needsFixing.length} members\n`);
  
  // Step 3: Find highest 7-digit number
  const highest7Digit = correct7Digit
    .map(m => parseInt(m.member_number.replace('DAY1', '')))
    .sort((a, b) => b - a)[0];
  
  console.log(`📊 Highest existing 7-digit number: DAY1${highest7Digit}`);
  console.log(`📊 Starting new assignments from: DAY1${highest7Digit + 1}\n`);
  
  // Step 4: Categorize members needing fixes
  const categories = {
    '6-digit': needsFixing.filter(m => /^DAY1\d{6}$/.test(m.member_number)),
    '8-digit': needsFixing.filter(m => /^DAY1\d{8}$/.test(m.member_number)),
    '9-digit': needsFixing.filter(m => /^DAY1\d{9}$/.test(m.member_number)),
    '10-digit': needsFixing.filter(m => /^DAY1\d{10}$/.test(m.member_number)),
    'with-letters': needsFixing.filter(m => !/^DAY1\d+$/.test(m.member_number)),
    'other': needsFixing.filter(m => 
      /^DAY1\d+$/.test(m.member_number) && 
      !/^DAY1\d{6,10}$/.test(m.member_number)
    )
  };
  
  console.log('📋 Members to fix by category:');
  Object.entries(categories).forEach(([cat, members]) => {
    if (members.length > 0) {
      console.log(`   ${cat}: ${members.length} members`);
    }
  });
  console.log('');
  
  // Step 5: Generate new member numbers and prepare updates
  let nextNumber = highest7Digit + 1;
  const updates = [];
  
  needsFixing.forEach(member => {
    const oldNumber = member.member_number;
    const newNumber = `DAY1${String(nextNumber).padStart(7, '0')}`;
    
    updates.push({
      id: member.id,
      oldNumber: oldNumber,
      newNumber: newNumber,
      name: `${member.first_name} ${member.last_name}`
    });
    
    nextNumber++;
  });
  
  console.log(`📝 Prepared ${updates.length} updates\n`);
  console.log('First 10 updates:');
  updates.slice(0, 10).forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.oldNumber} → ${u.newNumber} | ${u.name}`);
  });
  console.log('');
  
  // Step 6: Execute updates
  console.log('🚀 Starting database updates...\n');
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (let i = 0; i < updates.length; i++) {
    const update = updates[i];
    
    const { error } = await supabase
      .from('members')
      .update({ member_number: update.newNumber })
      .eq('id', update.id);
    
    if (error) {
      errorCount++;
      errors.push({ update, error: error.message });
      console.log(`❌ Error updating ${update.oldNumber}: ${error.message}`);
    } else {
      successCount++;
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Progress: ${i + 1}/${updates.length} updated`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Successfully updated: ${successCount} members`);
  console.log(`❌ Errors: ${errorCount} members`);
  console.log(`📈 New highest number: DAY1${String(nextNumber - 1).padStart(7, '0')}`);
  console.log(`📌 Next available number: DAY1${String(nextNumber).padStart(7, '0')}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    errors.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.update.oldNumber} → ${e.update.newNumber}: ${e.error}`);
    });
  }
  
  console.log('\n✅ Standardization complete!');
}

fixDay1MemberNumbers().catch(console.error);
