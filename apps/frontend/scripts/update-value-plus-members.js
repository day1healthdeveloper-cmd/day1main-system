const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Plan IDs from INSURANCE_PLANS_REFERENCE.md
const VALUE_PLUS_PLAN_ID = '499e3163-0df1-48fa-b403-a1b3850f9acd'; // Value Plus Plan (Comprehensive)
const VALUE_PLUS_HOSPITAL_PLAN_ID = '6f016877-6b34-485f-96c7-2f14bdaf81c4'; // Value Plus Hospital Plan

// Map plan name variants to correct plan_id
function getPlanId(planName) {
  const name = planName.toUpperCase();
  
  // Hospital Only plans
  if (name.includes('HOSPITAL ONLY')) {
    return VALUE_PLUS_HOSPITAL_PLAN_ID;
  }
  
  // All other Value Plus variants map to comprehensive plan
  // Includes: DAY1 VALUE PLUS PLAN, Black Friday, WITH FUNERAL, -CHF, etc.
  if (name.includes('VALUE PLUS')) {
    return VALUE_PLUS_PLAN_ID;
  }
  
  // Default to comprehensive plan
  return VALUE_PLUS_PLAN_ID;
}

// Member data from Excel - first batch of 56 members
const memberUpdates = [
  { member_number: 'THR1000054', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'BPO10000123', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'MTS1001716', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'MTS1002502', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'MTS1002897', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'MTS1002953', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'MTS1002977', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17005610', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17033914', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'ARC1000022', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'ARC1000048', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'ARC1000210', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'ARC1000260', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'ARC1000303', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'ARC1000377', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'ARC1000417', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'ARC1000510', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'AIB1001094', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'AIB1001111', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'ZWH1000793', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'ZWH1000968', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'BOU1000392', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'BOU1000721', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'BSN10000003', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'AXE1000016', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'AXE1000196', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'CSS1000664', plan_name: 'DAY1 VALUE PLUS PLAN HOSPITAL ONLY' },
  { member_number: 'CSS1000734', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17028089', plan_name: 'DAY1 VALUE PLUS PLAN Black Friday' },
  { member_number: 'DAY17028980', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17030855', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17050923', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY10015689', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY10015836', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY1006377', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17002187', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17007220', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17014036', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17014984', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17026203', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17026686', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17026713', plan_name: 'DAY1 VALUE PLUS PLAN (WITH FUNERAL)' },
  { member_number: 'DAY17026952', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17028499', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17030167', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17030951', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17031033', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17031037', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17031463', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17031960', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17032032', plan_name: 'DAY1 VALUE PLUS PLAN' },
  { member_number: 'DAY17032666', plan_name: 'DAY1 VALUE PLUS PLAN' },
];

async function updateValuePlusMembers() {
  console.log(`🔄 Updating ${memberUpdates.length} Value Plus members...\n`);

  let successCount = 0;
  let errorCount = 0;
  let notFoundCount = 0;

  for (const update of memberUpdates) {
    const planId = getPlanId(update.plan_name);
    
    // First check if member exists
    const { data: existing } = await supabase
      .from('members')
      .select('member_number')
      .eq('member_number', update.member_number)
      .single();

    if (!existing) {
      console.log(`⚠️  ${update.member_number}: Not found in database`);
      notFoundCount++;
      continue;
    }

    const { error } = await supabase
      .from('members')
      .update({
        plan_name: update.plan_name,
        plan_id: planId
      })
      .eq('member_number', update.member_number);

    if (error) {
      console.error(`❌ ${update.member_number}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`✅ ${update.member_number}: ${update.plan_name}`);
      successCount++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Successfully updated: ${successCount}`);
  console.log(`⚠️  Not found: ${notFoundCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total processed: ${memberUpdates.length}`);
}

updateValuePlusMembers().catch(console.error);
