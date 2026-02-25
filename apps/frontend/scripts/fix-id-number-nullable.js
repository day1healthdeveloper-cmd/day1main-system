const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixSchema() {
  console.log('Making id_number column nullable...');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE members ALTER COLUMN id_number DROP NOT NULL;'
  });
  
  if (error) {
    console.error('Error:', error);
    // Try alternative approach - direct query
    const { error: error2 } = await supabase
      .from('members')
      .update({ id_number: null })
      .is('id_number', null);
    
    console.log('Note: You may need to run this SQL manually in Supabase SQL Editor:');
    console.log('ALTER TABLE members ALTER COLUMN id_number DROP NOT NULL;');
  } else {
    console.log('Success! id_number is now nullable');
  }
}

fixSchema()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
