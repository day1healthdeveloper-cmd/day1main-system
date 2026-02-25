require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProviders() {
  // Get sample provider
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Providers table schema (sample record):');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('Providers table is empty');
  }

  // Get count
  const { count } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal providers: ${count}`);
}

checkProviders();
