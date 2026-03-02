const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// THE 9 INSURANCE PLANS - Reference: docs/INSURANCE_PLANS_REFERENCE.md
const PLAN_IDS = {
  'Executive Hospital Plan': '9bb038ad-dbf6-480c-a71e-adb93943cb1c',
  'Executive Junior Plan': 'c9f5019e-d584-4fe3-8e59-84682718f6ac',
  'Executive Plan': 'f64e2f78-14ba-425a-9fde-863e4ad708f1',
  'Platinum Hospital Plan': '57c3f348-36da-4e95-b357-d90518101bfc',
  'Platinum Plan': '8730897b-c8db-4d36-82e8-a0cc80998155',
  'Senior Comprehensive Hospital Plan': 'f962addc-2ecb-42c5-a16e-56af84417fd7',
  'Value Plus Hospital Plan': '6f016877-6b34-485f-96c7-2f14bdaf81c4',
  'Value Plus Hospital Plan - Senior': 'c7d41748-cbfa-4476-a8db-0dc21cf046aa',
  'Value Plus Plan': '499e3163-0df1-48fa-b403-a1b3850f9acd'
};

async function createPoliciesOnly() {
  console.log('🔄 Creating 9 policies in policies table...\n');
  console.log('📋 Using plans from INSURANCE_PLANS_REFERENCE.md\n');

  let createdCount = 0;
  
  for (const [planName, productId] of Object.entries(PLAN_IDS)) {
    // Generate policy number
    const shortName = planName.substring(0, 10).replace(/\s/g, '').toUpperCase();
    const policyNumber = `POL-${shortName}-2024`;
    
    const { data: policy, error} = await supabase
      .from('policies')
      .insert({
        policy_number: policyNumber,
        product_id: productId,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error creating policy for ${planName}:`, error.message);
      continue;
    }

    console.log(`✅ Created: ${policyNumber}`);
    console.log(`   Plan: ${planName}`);
    console.log(`   Policy ID: ${policy.id}`);
    console.log('');
    createdCount++;
  }

  console.log(`\n✨ Complete! Created ${createdCount} policies`);
  
  // Show all policies
  console.log('\n📋 All policies in database:\n');
  const { data: allPolicies } = await supabase
    .from('policies')
    .select('id, policy_number, product_id, status')
    .order('policy_number');

  allPolicies?.forEach(p => {
    const planName = Object.keys(PLAN_IDS).find(key => PLAN_IDS[key] === p.product_id);
    console.log(`   ${p.policy_number} - ${planName} (${p.status})`);
  });
}

createPoliciesOnly().catch(console.error);
