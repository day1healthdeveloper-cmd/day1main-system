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

async function checkPlus1Schema() {
  console.log('🔍 Checking Plus1Rewards members table schema...\n');
  
  // Get one member to see all columns
  const { data, error } = await plus1Supabase
    .from('members')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('✅ Columns in Plus1 members table:');
    Object.keys(data[0]).forEach(col => {
      console.log(`  - ${col}: ${typeof data[0][col]} (${data[0][col] === null ? 'NULL' : 'has value'})`);
    });
  } else {
    console.log('❌ No members found in Plus1 database');
  }
}

checkPlus1Schema();
