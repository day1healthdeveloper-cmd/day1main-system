require('dotenv').config({ path: '../apps/frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixProviderStatus() {
  console.log('🔄 Fixing provider status...\n');

  try {
    // Update all providers with null or missing status to 'active'
    const { data, error } = await supabase
      .from('providers')
      .update({ status: 'active' })
      .is('status', null)
      .select();

    if (error) throw error;

    console.log(`✅ Updated ${data?.length || 0} providers with null status to active`);

    // Also update any that might have empty string
    const { data: data2, error: error2 } = await supabase
      .from('providers')
      .update({ status: 'active' })
      .eq('status', '')
      .select();

    if (error2) throw error2;

    console.log(`✅ Updated ${data2?.length || 0} providers with empty status to active`);

    // Get final count
    const { count, error: countError } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    console.log(`\n📊 Total providers: ${count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixProviderStatus();
