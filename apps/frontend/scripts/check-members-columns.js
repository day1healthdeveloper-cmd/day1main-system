const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMembersColumns() {
  // Get one member to see ALL columns
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('ALL COLUMNS IN MEMBERS TABLE:\n');
  const columns = Object.keys(data).sort();
  
  columns.forEach(col => {
    console.log(`  - ${col}`);
  });

  console.log('\n\nPOLICY-RELATED COLUMNS:');
  const policyColumns = columns.filter(c => 
    c.includes('policy') || 
    c.includes('plan') || 
    c.includes('product')
  );
  
  policyColumns.forEach(col => {
    console.log(`  ✓ ${col}: ${data[col]}`);
  });
}

checkMembersColumns().catch(console.error);
