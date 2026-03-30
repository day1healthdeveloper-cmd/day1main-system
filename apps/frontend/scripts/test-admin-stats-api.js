require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminStats() {
  console.log('🧪 Testing Admin Dashboard Stats API\n');
  
  // Test each query individually
  console.log('📊 Testing individual queries:\n');
  
  const { count: membersCount, error: membersError } = await supabase
    .from('members')
    .select('id', { count: 'exact', head: true });
  console.log(`Members: ${membersCount} ${membersError ? '❌ ' + membersError.message : '✅'}`);
  
  const { count: dependantsCount, error: dependantsError } = await supabase
    .from('member_dependants')
    .select('id', { count: 'exact', head: true });
  console.log(`Dependants: ${dependantsCount} ${dependantsError ? '❌ ' + dependantsError.message : '✅'}`);
  
  const { count: activeMembersCount, error: activeMembersError } = await supabase
    .from('members')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');
  console.log(`Active Members: ${activeMembersCount} ${activeMembersError ? '❌ ' + activeMembersError.message : '✅'}`);
  
  const { count: activeDependantsCount, error: activeDependantsError } = await supabase
    .from('member_dependants')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');
  console.log(`Active Dependants: ${activeDependantsCount} ${activeDependantsError ? '❌ ' + activeDependantsError.message : '✅'}`);
  
  const { count: policiesCount, error: policiesError } = await supabase
    .from('policies')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');
  console.log(`Active Policies: ${policiesCount} ${policiesError ? '❌ ' + policiesError.message : '✅'}`);
  
  const { count: claimsCount, error: claimsError } = await supabase
    .from('claims')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');
  console.log(`Pending Claims: ${claimsCount} ${claimsError ? '❌ ' + claimsError.message : '✅'}`);
  
  const { count: preauthsCount, error: preauthsError } = await supabase
    .from('preauths')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');
  console.log(`Pending Preauths: ${preauthsCount} ${preauthsError ? '❌ ' + preauthsError.message : '✅'}`);
  
  const { count: providersCount, error: providersError } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true });
  console.log(`Providers: ${providersCount} ${providersError ? '❌ ' + providersError.message : '✅'}`);
  
  const { count: brokersCount, error: brokersError } = await supabase
    .from('brokers')
    .select('id', { count: 'exact', head: true });
  console.log(`Brokers: ${brokersCount} ${brokersError ? '❌ ' + brokersError.message : '✅'}`);
  
  console.log('\n📈 CALCULATED STATS:\n');
  console.log(`Total Members: ${(membersCount || 0) + (dependantsCount || 0)}`);
  console.log(`Active Members: ${(activeMembersCount || 0) + (activeDependantsCount || 0)}`);
  console.log(`Active Policies: ${policiesCount || 0}`);
  console.log(`Pending Claims: ${claimsCount || 0}`);
  console.log(`Pending Preauths: ${preauthsCount || 0}`);
  console.log(`Providers: ${providersCount || 0}`);
  console.log(`Brokers: ${brokersCount || 0}`);
}

testAdminStats().catch(console.error);
