require('dotenv').config({ path: '../apps/frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkProviderCount() {
  console.log('🔍 Checking provider count in database...\n');

  try {
    // Get total count
    const { count, error } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    console.log(`✅ Total providers in database: ${count}`);

    // Get count by status with no limit
    const { data: statusCounts, error: statusError } = await supabase
      .from('providers')
      .select('status')
      .limit(2000);

    if (statusError) throw statusError;

    const statusBreakdown = statusCounts.reduce((acc, p) => {
      acc[p.status || 'null'] = (acc[p.status || 'null'] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Breakdown by status:');
    Object.entries(statusBreakdown).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log(`\n📝 Note: Fetched ${statusCounts.length} records for status breakdown`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProviderCount();
