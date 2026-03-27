require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkCounts() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔍 Checking member counts...\n');

  // Count members
  const { count: membersCount, error: membersError } = await supabase
    .from('members')
    .select('id', { count: 'exact', head: true });

  if (membersError) {
    console.error('❌ Error counting members:', membersError);
  } else {
    console.log(`👥 Members: ${membersCount}`);
  }

  // Count dependants
  const { count: dependantsCount, error: dependantsError } = await supabase
    .from('member_dependants')
    .select('id', { count: 'exact', head: true });

  if (dependantsError) {
    console.error('❌ Error counting dependants:', dependantsError);
  } else {
    console.log(`👨‍👩‍👧‍👦 Dependants: ${dependantsCount}`);
  }

  // Total
  const total = (membersCount || 0) + (dependantsCount || 0);
  console.log(`\n📊 TOTAL MEMBERS: ${total}`);

  // Count by status
  console.log('\n📋 Members by status:');
  const statuses = ['active', 'pending', 'suspended', 'inactive'];
  
  for (const status of statuses) {
    const { count, error } = await supabase
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('status', status);
    
    if (!error) {
      console.log(`  ${status}: ${count}`);
    }
  }

  // Count dependants by status
  console.log('\n📋 Dependants by status:');
  for (const status of statuses) {
    const { count, error } = await supabase
      .from('member_dependants')
      .select('id', { count: 'exact', head: true })
      .eq('status', status);
    
    if (!error) {
      console.log(`  ${status}: ${count}`);
    }
  }

  // Count policies
  const { count: policiesCount, error: policiesError } = await supabase
    .from('policies')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');

  if (!policiesError) {
    console.log(`\n📄 Active Policies: ${policiesCount}`);
  }

  // Count providers
  const { count: providersCount, error: providersError } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true });

  if (!providersError) {
    console.log(`🏥 Total Providers: ${providersCount}`);
  }

  // Count brokers
  const { count: brokersCount, error: brokersError } = await supabase
    .from('brokers')
    .select('id', { count: 'exact', head: true });

  if (!brokersError) {
    console.log(`🤝 Total Brokers: ${brokersCount}`);
  }

  // Count claims
  const { count: claimsCount, error: claimsError } = await supabase
    .from('claims')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (!claimsError) {
    console.log(`⏳ Pending Claims: ${claimsCount}`);
  }
}

checkCounts().catch(console.error);
