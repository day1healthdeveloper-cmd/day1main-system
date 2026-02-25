require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fix() {
  console.log('Finding D1ACU member...\n');
  
  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('broker_code', 'D1ACU')
    .single();

  if (!member) {
    console.log('No D1ACU member found');
    return;
  }

  console.log(`Found: ${member.member_number} - ${member.first_name} ${member.last_name}`);
  console.log(`Current broker_code: ${member.broker_code}`);
  
  // Fix member number from DAY1AC1000048 to ACU1000048
  const newMemberNumber = member.member_number.replace('DAY1AC', 'ACU');
  
  console.log(`\nUpdating:`);
  console.log(`  member_number: ${member.member_number} → ${newMemberNumber}`);
  console.log(`  broker_code: D1ACU → ACU`);
  
  const { error } = await supabase
    .from('members')
    .update({
      member_number: newMemberNumber,
      broker_code: 'ACU'
    })
    .eq('id', member.id);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n✓ Fixed successfully!');
}

fix();
