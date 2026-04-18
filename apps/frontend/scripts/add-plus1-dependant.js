/**
 * Add Dependant to Plus1Rewards Database
 * Run with: node scripts/add-plus1-dependant.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const plus1Url = process.env.PLUS1_SUPABASE_URL;
const plus1Key = process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY;

if (!plus1Url || !plus1Key) {
  console.error('❌ Missing Plus1 Supabase credentials');
  process.exit(1);
}

const plus1Supabase = createClient(plus1Url, plus1Key);

async function addDependant() {
  console.log('🔍 Adding dependant to Plus1Rewards database...\n');

  // Step 1: Find Frikkie's member_cover_plan_id
  console.log('Step 1: Finding Frikkie\'s member_cover_plan_id...');
  const { data: coverPlans, error: coverError } = await plus1Supabase
    .from('member_cover_plans')
    .select('id, member_id')
    .eq('member_id', (
      await plus1Supabase
        .from('members')
        .select('id')
        .eq('cell_phone', '0215551111')
        .single()
    ).data.id)
    .single();

  if (coverError || !coverPlans) {
    console.error('❌ Error finding cover plan:', coverError);
    
    // Try alternative: get member first, then cover plan
    console.log('\nTrying alternative method...');
    const { data: member, error: memberError } = await plus1Supabase
      .from('members')
      .select('id, first_name, last_name, cell_phone')
      .eq('cell_phone', '0215551111')
      .single();

    if (memberError || !member) {
      console.error('❌ Error finding member:', memberError);
      process.exit(1);
    }

    console.log('✅ Found member:', member.first_name, member.last_name);
    console.log('   Member ID:', member.id);

    // Get cover plan
    const { data: coverPlan, error: cpError } = await plus1Supabase
      .from('member_cover_plans')
      .select('id')
      .eq('member_id', member.id)
      .single();

    if (cpError || !coverPlan) {
      console.error('❌ Error finding cover plan:', cpError);
      process.exit(1);
    }

    console.log('✅ Found cover plan ID:', coverPlan.id);

    // Step 2: Insert dependant
    console.log('\nStep 2: Inserting dependant...');
    const { data: dependant, error: insertError } = await plus1Supabase
      .from('dependants')
      .insert({
        member_cover_plan_id: coverPlan.id,
        linked_to_main_member_id: member.id,
        dependant_type: 'child',
        first_name: 'Riki',
        last_name: 'du Toit',
        id_number: '1404245228080'
      })
      .select();

    if (insertError) {
      console.error('❌ Error inserting dependant:', insertError);
      process.exit(1);
    }

    if (!dependant || dependant.length === 0) {
      console.error('❌ No dependant data returned');
      process.exit(1);
    }

    const dep = dependant[0];
    console.log('✅ Dependant added successfully!');
    console.log('   Dependant ID:', dep.id);
    console.log('   Name:', dep.first_name, dep.last_name);
    console.log('   Type:', dep.dependant_type);
    console.log('   ID Number:', dep.id_number);
    console.log('\n✅ Plus1 dependants table updated!');
    return;
  }

  console.log('✅ Found cover plan ID:', coverPlans.id);

  // Step 2: Insert dependant
  console.log('\nStep 2: Inserting dependant...');
  const { data: dependant, error: insertError } = await plus1Supabase
    .from('dependants')
    .insert({
      member_cover_plan_id: coverPlans.id,
      linked_to_main_member_id: coverPlans.member_id,
      dependant_type: 'child',
      first_name: 'Riki',
      last_name: 'du Toit',
      id_number: '1404245228080'
    })
    .select();

  if (insertError) {
    console.error('❌ Error inserting dependant:', insertError);
    process.exit(1);
  }

  if (!dependant || dependant.length === 0) {
    console.error('❌ No dependant data returned');
    process.exit(1);
  }

  const dep = dependant[0];
  console.log('✅ Dependant added successfully!');
  console.log('   Dependant ID:', dep.id);
  console.log('   Name:', dep.first_name, dep.last_name);
  console.log('   Type:', dep.dependant_type);
  console.log('   ID Number:', dep.id_number);
  console.log('\n✅ Plus1 dependants table updated!');
}

addDependant();
