require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkExactCounts() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔍 Querying database directly for exact counts...\n');

  // Get exact count
  const { count: membersCount, error: membersErr } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true });

  const { count: dependantsCount, error: dependantsErr } = await supabase
    .from('member_dependants')
    .select('*', { count: 'exact', head: true });

  console.log('📊 EXACT DATABASE COUNTS:');
  console.log('='.repeat(50));
  console.log(`👥 Members table: ${membersCount}`);
  console.log(`👨‍👩‍👧‍👦 Dependants table: ${dependantsCount}`);
  console.log(`📈 TOTAL: ${(membersCount || 0) + (dependantsCount || 0)}`);
  console.log('='.repeat(50));

  // Get status breakdown
  console.log('\n📋 Members by status:');
  const { data: membersByStatus } = await supabase
    .from('members')
    .select('status');
  
  const statusCounts = {};
  membersByStatus?.forEach(m => {
    statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
  });
  
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  console.log('\n📋 Dependants by status:');
  const { data: depsByStatus } = await supabase
    .from('member_dependants')
    .select('status');
  
  const depStatusCounts = {};
  depsByStatus?.forEach(d => {
    depStatusCounts[d.status] = (depStatusCounts[d.status] || 0) + 1;
  });
  
  Object.entries(depStatusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  // Check if import is still running
  console.log('\n🔄 Checking import status...');
  const { data: recentMembers } = await supabase
    .from('members')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1);

  if (recentMembers && recentMembers.length > 0) {
    const lastImport = new Date(recentMembers[0].created_at);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastImport) / 1000 / 60);
    
    if (diffMinutes < 5) {
      console.log(`⏳ Import still running (last member added ${diffMinutes} minutes ago)`);
    } else {
      console.log(`✅ Import completed (last member added ${diffMinutes} minutes ago)`);
    }
  }
}

checkExactCounts().catch(console.error);
