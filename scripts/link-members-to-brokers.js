const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function linkMembersToBrokers() {
  console.log('🔗 Linking members to brokers...\n');

  // Get all brokers
  const { data: brokers, error: brokersError } = await supabase
    .from('brokers')
    .select('*');

  if (brokersError) {
    console.error('Error fetching brokers:', brokersError);
    return;
  }

  console.log(`Found ${brokers.length} brokers\n`);

  // Get all members
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('id, member_number, broker_id, broker_code');

  if (membersError) {
    console.error('Error fetching members:', membersError);
    return;
  }

  console.log(`Found ${members.length} members\n`);

  let updated = 0;
  let skipped = 0;
  let notMatched = 0;

  // Link members to brokers based on member_number prefix
  for (const member of members) {
    if (!member.member_number) {
      skipped++;
      continue;
    }

    // Extract prefix from member_number (e.g., "DAY17001310" -> "DAY1")
    // Member numbers are formatted as: PREFIX + YYMMDDXX
    // We need to match against broker policy_prefix
    let matchedBroker = null;

    // Try to match by checking if member_number starts with broker code
    for (const broker of brokers) {
      // Check if member_number starts with the broker's policy_prefix
      if (member.member_number.startsWith(broker.policy_prefix)) {
        matchedBroker = broker;
        break;
      }
    }

    if (matchedBroker) {
      // Update member with broker_id and broker_code
      const { error: updateError } = await supabase
        .from('members')
        .update({
          broker_id: matchedBroker.id,
          broker_code: matchedBroker.code,
        })
        .eq('id', member.id);

      if (updateError) {
        console.error(`Error updating member ${member.member_number}:`, updateError.message);
      } else {
        updated++;
        if (updated % 100 === 0) {
          console.log(`Updated ${updated} members...`);
        }
      }
    } else {
      notMatched++;
      if (notMatched <= 10) {
        console.log(`⚠️  No broker match for member: ${member.member_number}`);
      }
    }
  }

  console.log('\n✅ Linking complete!');
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped (no member_number): ${skipped}`);
  console.log(`   Not matched: ${notMatched}`);

  // Show broker member counts
  console.log('\n📊 Member counts by broker:');
  for (const broker of brokers) {
    const { count } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('broker_id', broker.id);

    if (count > 0) {
      console.log(`   ${broker.code} (${broker.policy_prefix}): ${count} members`);
    }
  }
}

linkMembersToBrokers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
