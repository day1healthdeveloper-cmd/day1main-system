require('dotenv').config({ path: 'apps/backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMemberData() {
  console.log('Checking actual member data...\n');

  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('Members found:', members.length);
  console.log('\nFirst member data:');
  if (members.length > 0) {
    console.log(JSON.stringify(members[0], null, 2));
  }
}

checkMemberData();
