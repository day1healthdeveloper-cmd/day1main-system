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

async function createPoliciesAndLinkMembers() {
  console.log('🔄 Creating policies and linking members...\n');
  console.log('📋 Using 9 insurance plans from INSURANCE_PLANS_REFERENCE.md\n');

  const policyMap = {};
  
  // Create a policy for each of the 9 plans
  for (const [planName, productId] of Object.entries(PLAN_IDS)) {
    // Generate policy number
    const shortName = planName.substring(0, 10).replace(/\s/g, '').toUpperCase();
    const policyNumber = `POL-${shortName}-2024`;
    
    const { data: policy, error } = await supabase
      .from('policies')
      .insert({
        policy_number: policyNumber,
        product_id: productId,
        status: 'active',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        premium_amount: 500.00,
        coverage_type: 'individual'
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error creating policy for ${planName}:`, error);
      continue;
    }

    policyMap[planName] = policy.id;
    console.log(`✅ Created policy: ${policyNumber} for ${planName}`);
  }

  console.log('\n📊 Linking members to policies...\n');

  // Get all members
  const { data: members } = await supabase
    .from('members')
    .select('id, member_number, plan_name')
    .eq('status', 'active');

  console.log(`👥 Found ${members.length} active members\n`);

  let linkedCount = 0;
  let unmatchedCount = 0;

  for (const member of members) {
    // Try to match plan_name to product name
    let policyId = null;
    
    if (member.plan_name) {
      // Try exact match first
      policyId = policyMap[member.plan_name];
      
      // If no exact match, try partial match
      if (!policyId) {
        for (const [productName, id] of Object.entries(policyMap)) {
          if (productName.toLowerCase().includes(member.plan_name.toLowerCase()) ||
              member.plan_name.toLowerCase().includes(productName.toLowerCase())) {
            policyId = id;
            break;
          }
        }
      }
    }

    // If still no match, assign to Executive Plan (default)
    if (!policyId) {
      policyId = policyMap['Executive Plan'];
      unmatchedCount++;
    }

    // Update member with policy_id
    const { error } = await supabase
      .from('members')
      .update({ policy_id: policyId })
      .eq('id', member.id);

    if (!error) {
      linkedCount++;
    }
  }

  console.log(`\n✅ Linked ${linkedCount} members to policies`);
  console.log(`⚠️  ${unmatchedCount} members had no matching plan_name (assigned to Executive Plan)`);
  
  // Show summary
  console.log('\n📋 Summary by policy:\n');
  for (const [planName, policyId] of Object.entries(policyMap)) {
    const { count } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('policy_id', policyId);
    
    console.log(`   ${planName}: ${count} members`);
  }
}

createPoliciesAndLinkMembers().catch(console.error);
