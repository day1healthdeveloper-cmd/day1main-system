require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSearch() {
  console.log('Testing search for "TUMELO"...\n');
  
  const search = 'TUMELO';
  const cleanSearch = search.replace(/\s+/g, '');
  
  // Test the exact query the API uses
  const { data, error, count } = await supabase
    .from('members')
    .select('*, brokers(code, name)', { count: 'exact' })
    .or(`member_number.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,id_number.ilike.%${cleanSearch}%,mobile.ilike.%${search}%`)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Found ${count} members matching "TUMELO":\n`);
  
  if (data && data.length > 0) {
    data.forEach(member => {
      console.log(`${member.member_number} - ${member.first_name} ${member.last_name}`);
    });
  } else {
    console.log('No results found');
  }
  
  console.log('\n---\n');
  
  // Now test with dependants
  console.log('Testing with first member and their dependants...\n');
  
  if (data && data.length > 0) {
    const firstMember = data[0];
    console.log(`Main Member: ${firstMember.member_number} - ${firstMember.first_name} ${firstMember.last_name}`);
    
    const { data: dependants } = await supabase
      .from('member_dependants')
      .select('*')
      .eq('member_number', firstMember.member_number)
      .order('dependant_code');
    
    if (dependants && dependants.length > 0) {
      console.log(`\nDependants (${dependants.length}):`);
      dependants.forEach(dep => {
        console.log(`  ↳ ${dep.member_number}-${dep.dependant_code} - ${dep.first_name} ${dep.last_name} (${dep.dependant_type})`);
      });
    } else {
      console.log('\nNo dependants found');
    }
  }
}

testSearch().catch(console.error);
