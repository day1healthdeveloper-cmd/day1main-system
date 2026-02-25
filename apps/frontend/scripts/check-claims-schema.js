require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkClaims() {
  // Get sample claim
  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error:', error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log('Claims table schema (sample record):');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('Claims table is empty');
    
    // Try to get table structure
    const { data: structure } = await supabase
      .from('claims')
      .select('*')
      .limit(0);
    
    console.log('\nAttempting to infer structure...');
  }

  // Get count
  const { count } = await supabase
    .from('claims')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal claims: ${count}`);
}

checkClaims();
