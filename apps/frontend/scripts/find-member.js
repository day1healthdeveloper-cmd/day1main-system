require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findMember() {
  const searchTerm = process.argv[2] || 'RAYAAN';
  
  console.log(`🔍 Searching for: "${searchTerm}"\n`);
  
  // Search in members
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('member_number, first_name, last_name, id_number, status')
    .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
    .limit(10);
  
  console.log('📋 Members table:');
  if (members && members.length > 0) {
    members.forEach(m => {
      console.log(`  ${m.member_number} - ${m.first_name} ${m.last_name} (${m.status})`);
    });
  } else {
    console.log('  No results found');
  }
  
  // Search in dependants
  const { data: dependants, error: dependantsError } = await supabase
    .from('member_dependants')
    .select('member_number, dependant_code, first_name, last_name, id_number, status')
    .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
    .limit(10);
  
  console.log('\n👨‍👩‍👧‍👦 Dependants table:');
  if (dependants && dependants.length > 0) {
    dependants.forEach(d => {
      console.log(`  ${d.member_number}-${d.dependant_code} - ${d.first_name} ${d.last_name} (${d.status})`);
    });
  } else {
    console.log('  No results found');
  }
}

findMember().catch(console.error);
