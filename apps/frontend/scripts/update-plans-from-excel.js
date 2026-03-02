const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Plan IDs from INSURANCE_PLANS_REFERENCE.md
const PLAN_ID_MAP = {
  'VALUE_PLUS': '499e3163-0df1-48fa-b403-a1b3850f9acd',
  'VALUE_PLUS_HOSPITAL': '6f016877-6b34-485f-96c7-2f14bdaf81c4',
  'VALUE_PLUS_HOSPITAL_SENIOR': 'c7d41748-cbfa-4476-a8db-0dc21cf046aa',
};

function getPlanId(planName) {
  if (!planName) return null;
  
  const name = planName.toUpperCase();
  
  // Hospital Only plans
  if (name.includes('HOSPITAL ONLY')) {
    return PLAN_ID_MAP.VALUE_PLUS_HOSPITAL;
  }
  
  // Senior Hospital plans
  if (name.includes('SENIOR') && name.includes('HOSPITAL')) {
    return PLAN_ID_MAP.VALUE_PLUS_HOSPITAL_SENIOR;
  }
  
  // All other Value Plus variants
  if (name.includes('VALUE PLUS')) {
    return PLAN_ID_MAP.VALUE_PLUS;
  }
  
  return null;
}

async function updatePlansFromExcel(filePath) {
  console.log('📖 Reading Excel file...\n');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['Sheet1'];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  console.log(`Found ${data.length} members in Excel\n`);

  let successCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  const planCounts = {};

  for (const row of data) {
    const memberNumber = row['Member Number'];
    const planName = row['plan name'];

    if (!memberNumber) {
      skippedCount++;
      continue;
    }

    if (!planName) {
      skippedCount++;
      continue;
    }

    // Count plan variants
    planCounts[planName] = (planCounts[planName] || 0) + 1;

    const planId = getPlanId(planName);

    // Check if member exists
    const { data: existing } = await supabase
      .from('members')
      .select('member_number')
      .eq('member_number', memberNumber)
      .single();

    if (!existing) {
      notFoundCount++;
      continue;
    }

    // Update member with plan info
    const { error } = await supabase
      .from('members')
      .update({
        plan_name: planName,
        plan_id: planId
      })
      .eq('member_number', memberNumber);

    if (error) {
      console.error(`❌ ${memberNumber}: ${error.message}`);
      errorCount++;
    } else {
      successCount++;
      if (successCount % 100 === 0) {
        console.log(`✅ Processed ${successCount} members...`);
      }
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Successfully updated: ${successCount}`);
  console.log(`⚠️  Not found in DB: ${notFoundCount}`);
  console.log(`⏭️  Skipped (no data): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total in Excel: ${data.length}\n`);

  console.log(`\n📊 PLAN VARIANTS FOUND IN EXCEL:\n`);
  Object.entries(planCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([plan, count]) => {
      console.log(`  ${count.toString().padStart(4)} - ${plan}`);
    });
}

const filePath = process.argv[2] || 'docs/all members list.xlsx';
updatePlansFromExcel(filePath)
  .then(() => {
    console.log('\n✅ Update completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Update failed:', error);
    process.exit(1);
  });
