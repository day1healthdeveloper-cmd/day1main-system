require('dotenv').config({ path: '../apps/frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Use service role key for full access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateAllProviders() {
  console.log('🔄 Updating ALL providers to active status using service role...\n');

  try {
    // Simple update - set all to active
    const { data: updateData, error: updateError, count } = await supabase
      .from('providers')
      .update({ status: 'active' }, { count: 'exact' })
      .neq('status', 'active')
      .select();

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }
      
    console.log(`✅ Updated ${updateData?.length || 0} providers to active`);

    // Verify final count
    const { count: totalCount } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true });

    const { count: activeCount } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    console.log(`\n📊 Total providers: ${totalCount}`);
    console.log(`📊 Active providers: ${activeCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

updateAllProviders();
