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

const additionalDefinitions = [
  {
    term: 'Writing',
    definition: '(or words of similar meaning) means legible writing and in English and excludes any form of electronic communication contemplated in the Electronic Communications and Transactions Act, 25 of 2002.'
  },
  {
    term: 'Singular and Plural',
    definition: 'Any reference to the singular includes the plural and vice versa; and any reference to a gender includes the other gender.'
  },
  {
    term: 'Clause Headings',
    definition: 'The clause headings in this Policy have been inserted for convenience only and shall not be taken into account in its interpretation.'
  },
  {
    term: 'Substantive Provisions',
    definition: 'If any provision in a definition is a substantive provision conferring rights or imposing obligations on any party, effect shall be given to it as if it were a substantive clause in the body of the Policy, notwithstanding that it is only contained in the interpretation clause.'
  },
  {
    term: 'Governing Law',
    definition: 'This Policy shall be governed by, construed and interpreted in accordance with the law of the Republic of South Africa.'
  }
];

async function addAdditionalDefinitions() {
  console.log('🔄 Adding 5 additional definitions to all 9 plans...\n');

  let totalInserted = 0;

  for (const [planName, productId] of Object.entries(PLAN_IDS)) {
    console.log(`\n📝 Processing: ${planName}`);
    
    // Get the current max display_order for definitions in this plan
    const { data: existing } = await supabase
      .from('policy_section_items')
      .select('display_order')
      .eq('product_id', productId)
      .eq('section_type', 'definitions')
      .order('display_order', { ascending: false })
      .limit(1);

    const startOrder = existing && existing[0]?.display_order ? existing[0].display_order + 1 : 39;

    // Insert additional definitions for this product
    const itemsToInsert = additionalDefinitions.map((def, index) => ({
      product_id: productId,
      section_type: 'definitions',
      title: def.term,
      content: def.definition,
      display_order: startOrder + index
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('policy_section_items')
      .insert(itemsToInsert)
      .select();

    if (insertError) {
      console.error(`   ❌ Error inserting definitions:`, insertError);
      continue;
    }

    console.log(`   ✅ Inserted ${inserted.length} additional definitions (display_order ${startOrder}-${startOrder + inserted.length - 1})`);
    totalInserted += inserted.length;
  }

  console.log(`\n\n✨ Complete! Added ${totalInserted} total definition items across all plans`);
  console.log(`📊 Average: ${Math.round(totalInserted / Object.keys(PLAN_IDS).length)} definitions per plan`);
  
  // Verify totals
  console.log('\n📋 Verification - Total definitions per plan:\n');
  for (const [planName, productId] of Object.entries(PLAN_IDS)) {
    const { count } = await supabase
      .from('policy_section_items')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('section_type', 'definitions');
    
    console.log(`   ${planName}: ${count} definitions`);
  }
}

addAdditionalDefinitions().catch(console.error);
