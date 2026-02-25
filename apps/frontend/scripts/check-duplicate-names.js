require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDuplicates() {
  console.log('Fetching all members...\n');
  
  let allData = [];
  let from = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('members')
      .select('id, member_number, first_name, last_name, broker_code')
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error:', error);
      return;
    }

    if (!data || data.length === 0) break;
    
    allData = allData.concat(data);
    
    if (data.length < pageSize) break;
    from += pageSize;
  }

  console.log(`Total members: ${allData.length}\n`);

  // Group by first_name + last_name (case insensitive)
  const nameGroups = {};
  
  allData.forEach(member => {
    const key = `${member.first_name?.toLowerCase() || ''}_${member.last_name?.toLowerCase() || ''}`;
    if (!nameGroups[key]) {
      nameGroups[key] = [];
    }
    nameGroups[key].push(member);
  });

  // Find duplicates
  const duplicates = Object.entries(nameGroups)
    .filter(([key, members]) => members.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

  if (duplicates.length === 0) {
    console.log('✓ No duplicate names found!');
    return;
  }

  console.log(`Found ${duplicates.length} duplicate name combinations:\n`);
  
  duplicates.slice(0, 20).forEach(([key, members]) => {
    console.log(`${members[0].first_name} ${members[0].last_name} (${members.length} times):`);
    members.forEach(m => {
      console.log(`  - ${m.member_number} (${m.broker_code || 'NO_CODE'})`);
    });
    console.log('');
  });

  if (duplicates.length > 20) {
    console.log(`... and ${duplicates.length - 20} more duplicate name combinations\n`);
  }

  console.log(`Total duplicate name combinations: ${duplicates.length}`);
  console.log(`Total duplicate records: ${duplicates.reduce((sum, [, members]) => sum + members.length, 0)}`);
}

checkDuplicates();
