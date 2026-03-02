require('dotenv').config({ path: '../apps/frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function updateAllProvidersToActive() {
  console.log('🔄 Updating all providers to active status...\n');

  try {
    // First check current status distribution
    const { data: beforeData, error: beforeError } = await supabase
      .from('providers')
      .select('status');

    if (beforeError) throw beforeError;

    const beforeCounts = beforeData.reduce((acc, p) => {
      acc[p.status || 'null'] = (acc[p.status || 'null'] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Status before update:');
    Object.entries(beforeCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    // Update all providers to active
    const { data, error } = await supabase
      .from('providers')
      .update({ status: 'active' })
      .neq('status', 'active')
      .select();

    if (error) throw error;

    console.log(`\n✅ Updated ${data?.length || 0} providers to active status`);

    // Verify the update
    const { count: activeCount, error: countError } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (countError) throw countError;

    console.log(`\n📊 Total active providers now: ${activeCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateAllProvidersToActive();
