/**
 * Test Plus1 Dependant Insert
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const plus1 = createClient(
  process.env.PLUS1_SUPABASE_URL,
  process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
  {
    db: { schema: 'public' },
    auth: { persistSession: false }
  }
);

async function testInsert() {
  console.log('🔍 Testing Plus1 dependant insert...\n');
  
  const memberCoverPlanId = '73c64e4a-7eb3-4c1a-bc12-e98161901a6d';
  const memberId = '37ba83aa-5bcc-4b61-9e3b-cc43bd66f5bf';
  
  // Try minimal insert
  console.log('Attempting insert with minimal fields...');
  const { data, error } = await plus1
    .from('dependants')
    .insert([{
      member_cover_plan_id: memberCoverPlanId,
      linked_to_main_member_id: memberId,
      dependant_type: 'child',
      id_number: '1404245228080',
      first_name: 'Riki',
      last_name: 'du Toit'
    }])
    .select();
  
  if (error) {
    console.error('❌ Insert error:', JSON.stringify(error, null, 2));
    
    // Try to understand the trigger
    console.log('\n🔍 Checking if trigger is the issue...');
    console.log('The error mentions column "status" does not exist');
    console.log('This is likely from the trigger: trigger_sync_cover_plan_variant');
    console.log('The trigger function sync_member_cover_plan_variant() might be trying to update a status column');
    
    return;
  }
  
  console.log('✅ Success!');
  console.log(JSON.stringify(data, null, 2));
}

testInsert();
