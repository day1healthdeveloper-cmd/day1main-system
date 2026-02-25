const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAxeToAxs() {
  console.log('🔧 Changing AXE member numbers to AXS...\n');

  // Find the Accsure broker
  const { data: axsBroker, error: brokerError } = await supabase
    .from('brokers')
    .select('*')
    .or('code.eq.AXS,name.ilike.%Accsure%')
    .limit(1)
    .single();

  if (brokerError || !axsBroker) {
    console.error('Error finding Accsure broker:', brokerError);
    return;
  }

  console.log(`Found broker: ${axsBroker.name} (${axsBroker.code})`);
  console.log(`Current policy_prefix: ${axsBroker.policy_prefix}\n`);

  // Revert broker policy_prefix back to AXS if it was changed
  if (axsBroker.policy_prefix !== 'AXS') {
    const { error: updateBrokerError } = await supabase
      .from('brokers')
      .update({ policy_prefix: 'AXS' })
      .eq('id', axsBroker.id);

    if (updateBrokerError) {
      console.error('Error updating broker:', updateBrokerError);
      return;
    }
    console.log('✅ Reverted broker policy_prefix to AXS\n');
  }

  // Find all members with AXE prefix
  const { data: axeMembers, error: membersError } = await supabase
    .from('members')
    .select('id, member_number')
    .like('member_number', 'AXE%');

  if (membersError) {
    console.error('Error finding AXE members:', membersError);
    return;
  }

  console.log(`Found ${axeMembers.length} members with AXE prefix\n`);

  // Update each member's member_number from AXE to AXS
  let updated = 0;
  for (const member of axeMembers) {
    const newMemberNumber = member.member_number.replace(/^AXE/, 'AXS');
    
    const { error: updateError } = await supabase
      .from('members')
      .update({
        member_number: newMemberNumber,
        broker_id: axsBroker.id,
        broker_code: axsBroker.code,
      })
      .eq('id', member.id);

    if (updateError) {
      console.error(`Error updating member ${member.member_number}:`, updateError.message);
    } else {
      updated++;
      if (updated % 10 === 0) {
        console.log(`Updated ${updated} members...`);
      }
    }
  }

  console.log(`\n✅ Updated ${updated} member numbers from AXE to AXS\n`);

  // Show final count
  const { count } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('broker_id', axsBroker.id);

  console.log(`📊 Total members for ${axsBroker.name}: ${count}`);
}

fixAxeToAxs()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
