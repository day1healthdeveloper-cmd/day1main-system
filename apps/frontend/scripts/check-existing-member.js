const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExisting() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Sample member record structure:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n\nAll columns:');
    Object.keys(data).forEach(key => {
      const value = data[key];
      const type = value === null ? 'null' : typeof value;
      console.log(`  ${key}: ${type} = ${value}`);
    });
  }
}

checkExisting()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
