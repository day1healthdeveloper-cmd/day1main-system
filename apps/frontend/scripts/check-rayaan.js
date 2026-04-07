require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRayaan() {
  const { data, error } = await supabase
    .from('member_dependants')
    .select('*')
    .eq('first_name', 'RAYAAN')
    .single();
  
  if (data) {
    console.log('Found RAYAAN:');
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log('Not found:', error);
  }
}

checkRayaan().catch(console.error);
