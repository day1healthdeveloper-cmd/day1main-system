const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updatePieterMemberNumber() {
  console.log('🔍 Finding Pieter du Toit...\n');
  
  // Find Pieter du Toit
  const { data: members, error: searchError } = await supabase
    .from('members')
    .select('id, member_number, first_name, last_name, id_number, created_at')
    .ilike('first_name', 'Pieter')
    .ilike('last_name', 'Du Toit');
  
  if (searchError) {
    console.error('❌ Error searching:', searchError);
    return;
  }
  
  if (!members || members.length === 0) {
    console.log('❌ Pieter du Toit not found');
    return;
  }
  
  console.log(`Found ${members.length} member(s):`);
  members.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name} | ID: ${m.id_number} | Created: ${m.created_at}`);
  });
  
  // Use the most recent one (or the one with ID 6710135149084)
  const pieter = members.find(m => m.id_number === '6710135149084') || members[0];
  
  console.log(`\n📝 Updating: ${pieter.first_name} ${pieter.last_name}`);
  console.log(`   Current number: ${pieter.member_number}`);
  console.log(`   New number: DAY17056788\n`);
  
  // Update the member number
  const { error: updateError } = await supabase
    .from('members')
    .update({ member_number: 'DAY17056788' })
    .eq('id', pieter.id);
  
  if (updateError) {
    console.error('❌ Error updating:', updateError);
    return;
  }
  
  console.log('✅ Successfully updated Pieter du Toit to DAY17056788');
  console.log('📌 Next available number: DAY17056789');
}

updatePieterMemberNumber().catch(console.error);
