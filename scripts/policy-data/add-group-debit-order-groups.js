require('dotenv').config({ path: 'apps/backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const groups = [
  'Schonberg Wealth',
  'VNS Networking',
  'Carleton Engineering',
  'Eversheds',
  'ACVV',
  'Odire',
  'Newberry',
  'Shortterm Administrators',
  'Unplugg Group',
  'Corrocoat SA',
  'Qalo Holdings'
];

async function addGroups() {
  console.log(`Adding ${groups.length} Group Debit Order groups...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const groupName of groups) {
    // Generate group code from company name
    const groupCode = groupName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10);

    const { data, error } = await supabase
      .from('payment_groups')
      .insert({
        group_code: groupCode,
        group_name: groupName,
        company_name: groupName,
        group_type: 'group_debit_order',
        collection_method: 'group_debit_order',
        status: 'active',
        total_members: 0,
        total_monthly_premium: 0
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error adding ${groupName}:`, error.message);
      errorCount++;
    } else {
      console.log(`✓ Added ${groupName} (${groupCode})`);
      successCount++;
    }
  }

  console.log(`\n✅ Complete! ${successCount} groups added, ${errorCount} errors`);
}

addGroups();
