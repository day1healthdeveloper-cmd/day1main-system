const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixZWH() {
  // Get AIB broker
  const { data: broker } = await supabase
    .from('brokers')
    .select('id, code')
    .eq('code', 'AIB')
    .single();
  
  if (!broker) {
    console.error('AIB broker not found!');
    return;
  }
  
  console.log(`Found AIB broker: ${broker.code} (ID: ${broker.id})`);
  
  // Update ZWH members to AIB
  const { data: updated, error } = await supabase
    .from('members')
    .update({
      broker_code: 'AIB',
      broker_id: broker.id
    })
    .like('member_number', 'ZWH%')
    .select();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`\nUpdated ${updated.length} ZWH members to AIB broker:`);
    updated.forEach(m => {
      console.log(`  ${m.member_number} - ${m.first_name} ${m.last_name}`);
    });
  }
}

fixZWH()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
