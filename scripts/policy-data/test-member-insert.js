require('dotenv').config({ path: 'apps/backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testInsert() {
  console.log('Testing member insert to see required fields...\n');

  // Try to insert with minimal data
  const { data, error } = await supabase
    .from('members')
    .insert({
      member_number: 'TEST001',
      first_name: 'Test',
      last_name: 'User',
      id_number: '8001015800080',
      date_of_birth: '1980-01-01',
      monthly_premium: 100.00,
      status: 'active'
    })
    .select();

  if (error) {
    console.log('ERROR (this tells us what fields are required):');
    console.log('Message:', error.message);
    console.log('Details:', error.details);
    console.log('Hint:', error.hint);
    console.log('Code:', error.code);
  } else {
    console.log('Success! Member created:', data);
    
    // Clean up
    await supabase
      .from('members')
      .delete()
      .eq('member_number', 'TEST001');
    console.log('Test member deleted');
  }
}

testInsert();
