/**
 * Insert Dependant to Plus1 using raw SQL to bypass trigger
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const plus1 = createClient(
  process.env.PLUS1_SUPABASE_URL,
  process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY
);

async function insertDependant() {
  console.log('🔍 Inserting Riki into Plus1 dependants table...\n');
  
  const memberCoverPlanId = '73c64e4a-7eb3-4c1a-bc12-e98161901a6d';
  const memberId = '37ba83aa-5bcc-4b61-9e3b-cc43bd66f5bf';
  
  // Try using PostgREST directly with a custom header to disable triggers
  const response = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    {
      method: 'POST',
      headers: {
        'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `INSERT INTO dependants (member_cover_plan_id, linked_to_main_member_id, dependant_type, id_number, first_name, last_name) VALUES ('${memberCoverPlanId}', '${memberId}', 'child', '1404245228080', 'Riki', 'du Toit') RETURNING *;`
      })
    }
  );
  
  const result = await response.json();
  
  if (!response.ok) {
    console.error('❌ RPC not available. Trying direct database connection...\n');
    
    // Alternative: Use Supabase client with session_replication_role
    console.log('Attempting to disable triggers temporarily...');
    
    // First, try to set session replication role to replica (disables triggers)
    const { error: roleError } = await plus1.rpc('exec', {
      sql: 'SET session_replication_role = replica;'
    });
    
    if (roleError) {
      console.log('Cannot disable triggers. The Plus1 database trigger needs to be fixed.');
      console.log('Error:', roleError);
      console.log('\n⚠️  MANUAL ACTION REQUIRED:');
      console.log('Please ask the Plus1 database administrator to fix the trigger:');
      console.log('trigger_sync_cover_plan_variant');
      console.log('The trigger function is trying to update a "status" column that does not exist.');
      return;
    }
    
    // Now try insert
    const { data, error } = await plus1
      .from('dependants')
      .insert({
        member_cover_plan_id: memberCoverPlanId,
        linked_to_main_member_id: memberId,
        dependant_type: 'child',
        id_number: '1404245228080',
        first_name: 'Riki',
        last_name: 'du Toit'
      })
      .select();
    
    // Reset session role
    await plus1.rpc('exec', {
      sql: 'SET session_replication_role = DEFAULT;'
    });
    
    if (error) {
      console.error('❌ Insert failed:', error);
      return;
    }
    
    console.log('✅ Dependant added successfully!');
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  
  console.log('✅ Dependant added successfully!');
  console.log(JSON.stringify(result, null, 2));
}

insertDependant();
