const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findHighestDay1Member() {
  console.log('🔍 Finding highest DAY1xxxxx member number...\n');
  
  // First get total count of all members
  const { count: totalCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true });
  
  console.log(`Total members in database: ${totalCount}\n`);
  
  // Get ALL members with member_number starting with DAY1 (no limit)
  let allDay1Members = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data: members, error } = await supabase
      .from('members')
      .select('member_number, first_name, last_name, created_at')
      .ilike('member_number', 'DAY1%')
      .order('member_number', { ascending: false })
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
      console.log(`Fetched ${allDay1Members.length} DAY1 members so far...`);
    }
  }
  
  const members = allDay1Members;
  console.log(`\nTotal DAY1 members found: ${members.length}\n`);

  if (members.length > 0) {
    console.log('Top 10 highest DAY1 member numbers:');
    members.slice(0, 10).forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name} | Created: ${m.created_at}`);
    });

    console.log('\n📊 Highest DAY1 member number:', members[0].member_number);
    
    // Extract the numeric part
    const numericPart = members[0].member_number.replace('DAY1', '');
    console.log('   Numeric part:', numericPart);
    
    // Calculate next number
    const nextNumber = parseInt(numericPart) + 1;
    const nextMemberNumber = `DAY1${nextNumber.toString().padStart(numericPart.length, '0')}`;
    console.log('   Next available:', nextMemberNumber);
  } else {
    console.log('No DAY1 members found in database');
  }
}

findHighestDay1Member().catch(console.error);
