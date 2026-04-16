const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.PLUS1_SUPABASE_URL,
  process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    // Get one record to see all columns
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Plus1 Members Table Columns:\n');
      const columns = Object.keys(data[0]);
      columns.forEach(col => {
        const value = data[0][col];
        const type = value === null ? 'null' : typeof value;
        console.log(`  ${col}: ${type}`);
      });
      
      // Check specifically for PIN and cell phone
      console.log('\n🔍 Authentication Fields:');
      if (columns.includes('pin')) {
        console.log('  ✅ PIN field exists');
      } else {
        console.log('  ❌ PIN field NOT found');
      }
      
      if (columns.includes('cell_phone')) {
        console.log('  ✅ cell_phone field exists');
      } else {
        console.log('  ❌ cell_phone field NOT found');
      }
      
      // Show sample data (masked)
      console.log('\n📋 Sample Record (masked):');
      console.log('  cell_phone:', data[0].cell_phone ? '***' + data[0].cell_phone.slice(-4) : 'null');
      console.log('  pin:', data[0].pin ? '****' : 'null');
      
    } else {
      console.log('⚠️ No data found in Plus1 members table');
    }
  } catch (err) {
    console.error('❌ Script error:', err.message);
  }
})();
