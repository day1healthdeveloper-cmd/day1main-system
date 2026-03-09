const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function searchMemberById() {
  const searchId = '6710135149084';
  
  console.log(`🔍 Searching for ID number: ${searchId}\n`);
  
  // Search by id_number column
  const { data: byIdNumber, error: error1 } = await supabase
    .from('members')
    .select('*')
    .eq('id_number', searchId);

  console.log('Search by exact id_number:');
  console.log(byIdNumber);
  console.log('');

  // Search by id_number with LIKE
  const { data: byIdNumberLike, error: error2 } = await supabase
    .from('members')
    .select('*')
    .ilike('id_number', `%${searchId}%`);

  console.log('Search by id_number LIKE:');
  console.log(byIdNumberLike);
  console.log('');

  // Check what id_numbers actually exist (sample)
  const { data: sampleIds } = await supabase
    .from('members')
    .select('member_number, first_name, last_name, id_number')
    .not('id_number', 'is', null)
    .limit(20);

  console.log('Sample of 20 members with id_numbers:');
  sampleIds.forEach(m => {
    console.log(`  ${m.member_number} | ${m.first_name} ${m.last_name} | ID: ${m.id_number}`);
  });

  // Search by member_number
  const { data: byMemberNumber } = await supabase
    .from('members')
    .select('*')
    .ilike('member_number', `%${searchId}%`);

  console.log('\n\nSearch by member_number:');
  console.log(byMemberNumber);
}

searchMemberById().catch(console.error);
