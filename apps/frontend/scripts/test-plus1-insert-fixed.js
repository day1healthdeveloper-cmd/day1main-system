/**
 * Test Plus1 Dependant Insert - Verify Trigger Fix
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
  console.log('🔍 Testing Plus1 dependant insert after trigger fix...\n');
  
  // Use a test dependant to verify the trigger is fixed
  const testDependant = {
    member_cover_plan_id: '73c64e4a-7eb3-4c1a-bc12-e98161901a6d',
    linked_to_main_member_id: '37ba83aa-5bcc-4b61-9e3b-cc43bd66f5bf',
    dependant_type: 'child',
    id_number: '9999999999999', // Test ID
    first_name: 'Test',
    last_name: 'Dependant'
  };
  
  console.log('Attempting test insert...');
  const { data, error } = await plus1
    .from('dependants')
    .insert([testDependant])
    .select();
  
  if (error) {
    console.error('❌ Insert still failing:', JSON.stringify(error, null, 2));
    
    if (error.code === '42703' && error.message.includes('status')) {
      console.log('\n⚠️  The trigger issue is NOT fixed yet.');
      console.log('The trigger is still trying to reference the "status" column.');
    } else {
      console.log('\n⚠️  Different error encountered.');
    }
    
    return false;
  }
  
  console.log('✅ SUCCESS! Trigger issue is resolved!');
  console.log('Test dependant inserted:', JSON.stringify(data, null, 2));
  
  // Clean up test record
  console.log('\nCleaning up test record...');
  const { error: deleteError } = await plus1
    .from('dependants')
    .delete()
    .eq('id_number', '9999999999999');
  
  if (deleteError) {
    console.log('⚠️  Could not delete test record:', deleteError.message);
    console.log('Please manually delete the test dependant with ID: 9999999999999');
  } else {
    console.log('✅ Test record cleaned up successfully');
  }
  
  return true;
}

testInsert().then(success => {
  if (success) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PLUS1 DEPENDANTS TABLE IS NOW OPERATIONAL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nYou can now proceed with automated dependant additions.');
  } else {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  PLUS1 TRIGGER ISSUE STILL EXISTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nManual SQL inserts are still required.');
  }
});
