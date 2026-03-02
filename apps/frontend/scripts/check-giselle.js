const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkGiselle() {
  console.log('🔍 Searching for Giselle...\n');
  
  // Search by first name
  const { data: byFirstName } = await supabase
    .from('members')
    .select('*')
    .ilike('first_name', '%giselle%');
  
  console.log(`Found ${byFirstName?.length || 0} members with first name containing "giselle"`);
  if (byFirstName && byFirstName.length > 0) {
    byFirstName.forEach(m => {
      console.log(`  ${m.member_number}: ${m.first_name} ${m.last_name} - ${m.email}`);
    });
  }
  
  // Search by member number
  const { data: byNumber } = await supabase
    .from('members')
    .select('*')
    .eq('member_number', 'ZWH1000793');
  
  console.log(`\nSearching for member number ZWH1000793:`);
  if (byNumber && byNumber.length > 0) {
    console.log('  FOUND:', byNumber[0]);
  } else {
    console.log('  NOT FOUND in database');
  }
  
  // Check all ZWH members
  const { data: zwhMembers } = await supabase
    .from('members')
    .select('member_number, first_name, last_name')
    .ilike('member_number', 'ZWH%');
  
  console.log(`\nAll ZWH members in database (${zwhMembers?.length || 0}):`);
  if (zwhMembers) {
    zwhMembers.forEach(m => {
      console.log(`  ${m.member_number}: ${m.first_name} ${m.last_name}`);
    });
  }
}

checkGiselle().catch(console.error);
