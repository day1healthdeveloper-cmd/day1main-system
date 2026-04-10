const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const plus1Supabase = createClient(
  process.env.PLUS1_SUPABASE_URL,
  process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

async function checkPlus1Member() {
  const mobile = '0795320781';
  
  console.log('🔍 Checking Plus1Rewards database for mobile:', mobile);
  
  // Check if member exists
  const { data, error } = await plus1Supabase
    .from('members')
    .select('id, cell_phone, plan_status')
    .eq('cell_phone', mobile);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('✅ Plus1 member found:', data[0]);
  } else {
    console.log('❌ No Plus1 member found with mobile:', mobile);
  }
}

checkPlus1Member();
