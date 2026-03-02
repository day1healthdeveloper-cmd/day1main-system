const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPolicies() {
  console.log('🔍 Checking policies setup...\n');
  
  // Check if policies table exists and what's in it
  const { data: policies, error, count } = await supabase
    .from('policies')
    .select('*', { count: 'exact' })
    .limit(5);

  if (error) {
    console.log('❌ Policies table error:', error.message);
    console.log('\n💡 Need to create policies table or check schema');
    return;
  }

  console.log(`📊 Policies table exists`);
  console.log(`   Total policies: ${count || 0}`);
  
  if (policies && policies.length > 0) {
    console.log('\nSample policies:');
    policies.forEach(p => {
      console.log(`  - ${p.policy_number || p.id}: ${JSON.stringify(p)}`);
    });
  } else {
    console.log('\n⚠️  No policies created yet');
  }

  // Check members table structure for policy linking
  console.log('\n\n🔍 Checking members table policy fields...');
  const { data: sampleMember } = await supabase
    .from('members')
    .select('*')
    .limit(1)
    .single();

  if (sampleMember) {
    const policyFields = Object.keys(sampleMember).filter(k => 
      k.includes('policy') || k.includes('plan')
    );
    console.log('   Policy-related fields in members:', policyFields);
  }
}

checkPolicies().catch(console.error);
