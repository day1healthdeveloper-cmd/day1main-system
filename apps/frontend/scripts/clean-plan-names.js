const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mapping of old plan names to clean plan names
const planNameMapping = {
  // VALUE PLUS variants
  'DAY1 VALUE PLUS PLAN': 'VALUE PLUS PLAN',
  'DAY1 VALUE PLUS PLAN-CHF': 'VALUE PLUS PLAN',
  'DAY1 VALUE PLUS PLAN HOSPITAL ONLY': 'VALUE PLUS HOSPITAL PLAN',
  'DAY1 VALUE PLUS PLAN (WITH FUNERAL)': 'VALUE PLUS PLAN',
  'DAY1 VALUE PLUS PLAN Black Friday': 'VALUE PLUS PLAN',
  'VALUE PLUS PLAN HOSPITAL SENIOR': 'VALUE PLUS HOSPITAL PLAN - SENIOR',
  'DAY1 VALUE PLUS HOSPITAL PLAN SENIOR': 'VALUE PLUS HOSPITAL PLAN - SENIOR',
  'DAY1 VALUE PLAN': 'VALUE PLAN',
  'DAY1 VALUE PLAN ': 'VALUE PLAN',
  
  // EXECUTIVE variants
  'DAY1 EXECUTIVE PLAN': 'EXECUTIVE PLAN',
  'DAY1 EXECUTIVE PLAN-CHF': 'EXECUTIVE PLAN',
  'DAY1 EXECUTIVE PLAN SINGLE': 'EXECUTIVE PLAN',
  'DAY1 EXECUTIVE PLAN COUPLE': 'EXECUTIVE PLAN',
  'DAY1 EXECUTIVE HOSPITAL PLAN': 'EXECUTIVE HOSPITAL PLAN',
  'DAY1 EXECUTIVE REDUCER PLAN': 'EXECUTIVE PLAN',
  'EXECUTIVE PLAN DIRECT (OPTION 3) SINGLE': 'EXECUTIVE PLAN',
  'EXECUTIVE PLAN DIRECT (OPTION 3) COUPLE': 'EXECUTIVE PLAN',
  'EXECUTIVE PLAN 35+ DIRECT (OPTION 3) SINGLE': 'EXECUTIVE PLAN',
  'EXECUTIVE PLAN 35+ DIRECT (OPTION 3) COUPLE': 'EXECUTIVE PLAN',
  'JUNIOR EXECUTIVE PLAN': 'EXECUTIVE JUNIOR PLAN',
  
  // PLATINUM variants
  'DAY1 PLATINUM OPTION 1': 'PLATINUM PLAN',
  'DAY1 PLATINUM OPTION 2': 'PLATINUM PLAN',
  'DAY1 PLATINUM OPTION 3': 'PLATINUM PLAN',
  'DAY1 PLATINUM OPTION 1-CHF': 'PLATINUM PLAN',
  'DAY1 PLATINUM OPTION 1 MEDGROUP': 'PLATINUM PLAN',
  'PLATINUM DIRECT+ OPT1: COUPLE': 'PLATINUM PLAN',
  
  // SENIOR variants
  'SENIOR COMPREHENSIVE PLAN': 'SENIOR COMPREHENSIVE HOSPITAL PLAN',
  'SENIOR COMPREHENSIVE PLAN-CHF': 'SENIOR COMPREHENSIVE HOSPITAL PLAN',
  'DAY1: SENIOR OPTION': 'SENIOR COMPREHENSIVE HOSPITAL PLAN',
  'DAY1: GOOGLE ADS DIRECT SENIOR OPTION': 'SENIOR COMPREHENSIVE HOSPITAL PLAN',
  'DAY1: EDS REFERRAL SENIOR PLAN OPT1 - 55+': 'SENIOR COMPREHENSIVE HOSPITAL PLAN',
  
  // Remove all other DAY1 prefixed plans - they're marketing variants
  'DAY1 GOOGLE ADS DIRECT OPT1': 'EXECUTIVE PLAN',
  'DAY1 GOOGLE ADS DIRECT OPT2': 'EXECUTIVE PLAN',
  'DAY1 GOOGLE ADS DIRECT OPT3': 'EXECUTIVE PLAN',
  'DAY1 GOOGLE ADS DIRECT OPT1: COUPLE': 'EXECUTIVE PLAN',
  'DAY1 GOOGLE ADS DIRECT OPT2: COUPLE': 'EXECUTIVE PLAN',
  'DAY1 GOOGLE ADS DIRECT OPT3 : COUPLE': 'EXECUTIVE PLAN',
  'DAY1 SMI GOOGLE ADS OPT1': 'EXECUTIVE PLAN',
  'DAY1 SMI GOOGLE ADS OPT3': 'EXECUTIVE PLAN',
  'DAY1 SMI GOOGLE ADS OPT3: COUPLE': 'EXECUTIVE PLAN',
  'DAY1 OPTION 1': 'EXECUTIVE PLAN',
  'DAY1 OPTION 2': 'EXECUTIVE PLAN',
  'DAY1 OPTION 3': 'EXECUTIVE PLAN',
  'DAY1  OPTION 1': 'EXECUTIVE PLAN',
  'DAY1  OPTION 3': 'EXECUTIVE PLAN',
  'DAY1  OPTION 1 ': 'EXECUTIVE PLAN',
  'DAY1  OPTION 3 ': 'EXECUTIVE PLAN',
  'DAY1 OPTION 1 SINGLE': 'EXECUTIVE PLAN',
  'DAY1 OPTION 1 COUPLE': 'EXECUTIVE PLAN',
  'DAY1 OPTION 2 SINGLE': 'EXECUTIVE PLAN',
  'DAY1 OPTION 2 COUPLE': 'EXECUTIVE PLAN',
  'DAY1 OPTION 3 SINGLE': 'EXECUTIVE PLAN',
  'DAY1 OPTION 3 COUPLE': 'EXECUTIVE PLAN',
  'DAY1 BOOSTER SINGLE': 'EXECUTIVE PLAN',
  'DAY1 BOOSTER COUPLE': 'EXECUTIVE PLAN',
  'DAY1 BOOSTER PLUS SINGLE': 'EXECUTIVE PLAN',
  'DAY1 BOOSTER PLUS COUPLE': 'EXECUTIVE PLAN',
  'DAY1: WEBSITE R499 AGENTS OPT1': 'EXECUTIVE PLAN',
  'DAY1: WEBSITE R499 AGENTS OPT2': 'EXECUTIVE PLAN',
  'DAY1: WEBSITE R499 AGENTS OPT3': 'EXECUTIVE PLAN',
  'DAY1: WEBSITE R499 AGENTS OPT1 - COUPLE': 'EXECUTIVE PLAN',
  'DAY1: WEBSITE R499 AGENTS OPT2 - COUPLE': 'EXECUTIVE PLAN',
  'DAY1: WEBSITE R499 AGENTS OPT3 - COUPLE': 'EXECUTIVE PLAN',
  'DAY1: WEBSITE R499 AGENTS OPT3 ': 'EXECUTIVE PLAN',
  'DAY1: EDS WEBSITE 499 REFERRAL OPT1': 'EXECUTIVE PLAN',
  'DAY1: EDS WEBSITE 499 REFERRAL OPT3': 'EXECUTIVE PLAN',
  'DAY1: EDS WEBSITE 499 REFERRAL OPT3 ': 'EXECUTIVE PLAN',
  'DAY1: EDS WEBSITE 499 REFERRAL OPT1 - COUPLE': 'EXECUTIVE PLAN',
  'DAY1: EDS WEBSITE 499 REFERRAL OPT3 - COUPLE': 'EXECUTIVE PLAN',
  'DAY1: PerDM OPT1 - SINGLE': 'EXECUTIVE PLAN',
  'DAY1: PerDM OPT1 - COUPLE': 'EXECUTIVE PLAN',
  'DAY1: NAVIGATOR UPGRADE R499 OPT1': 'EXECUTIVE PLAN',
  'DAY1 AXON OPTION 1': 'EXECUTIVE PLAN',
  'DAY1: EDS WEBSITE 499 REFERRAL OPT1': 'EXECUTIVE PLAN',
  'DAY10024388': 'EXECUTIVE PLAN',
  'VEENA PILLAY (OPTION 3) SINGLE': 'EXECUTIVE PLAN',
  'DAY1 GOOGLE ADS DIRECT OPT2 ': 'EXECUTIVE PLAN',
};

async function cleanPlanNames() {
  console.log('🧹 Cleaning plan names...\n');

  // Get all unique plan names
  const { data: members } = await supabase
    .from('members')
    .select('plan_name')
    .not('plan_name', 'is', null);

  const uniquePlans = [...new Set(members.map(m => m.plan_name))];
  console.log(`Found ${uniquePlans.length} unique plan names\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const oldPlanName of uniquePlans) {
    const newPlanName = planNameMapping[oldPlanName];
    
    if (!newPlanName) {
      console.log(`⏭️  SKIP: "${oldPlanName}" - no mapping defined`);
      skippedCount++;
      continue;
    }

    if (oldPlanName === newPlanName) {
      console.log(`✓ OK: "${oldPlanName}" - already clean`);
      continue;
    }

    // Count members with this plan
    const { count } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('plan_name', oldPlanName);

    console.log(`🔄 UPDATE: "${oldPlanName}" → "${newPlanName}" (${count} members)`);

    // Update all members with this plan name
    const { error } = await supabase
      .from('members')
      .update({ plan_name: newPlanName })
      .eq('plan_name', oldPlanName);

    if (error) {
      console.error(`   ❌ Error: ${error.message}`);
    } else {
      updatedCount += count;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Updated ${updatedCount} member records`);
  console.log(`⏭️  Skipped ${skippedCount} unmapped plan names`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // Show final plan distribution
  console.log('\n📊 Final plan distribution:\n');
  const { data: finalMembers } = await supabase
    .from('members')
    .select('plan_name')
    .not('plan_name', 'is', null);

  const finalPlans = {};
  finalMembers.forEach(m => {
    finalPlans[m.plan_name] = (finalPlans[m.plan_name] || 0) + 1;
  });

  Object.entries(finalPlans)
    .sort((a, b) => b[1] - a[1])
    .forEach(([plan, count]) => {
      console.log(`  ${count.toString().padStart(4)} - ${plan}`);
    });
}

cleanPlanNames().catch(console.error);
