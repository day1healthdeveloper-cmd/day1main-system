const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkValuePlusDefinitions() {
  const productId = '499e3163-0df1-48fa-b403-a1b3850f9acd'; // Value Plus Plan
  
  const { data } = await supabase
    .from('policy_section_items')
    .select('title, display_order')
    .eq('product_id', productId)
    .eq('section_type', 'definitions')
    .order('display_order');

  console.log('Value Plus Plan - Total definitions:', data.length);
  console.log('\nLast 10 definitions:');
  data.slice(-10).forEach(d => {
    console.log(`  ${d.display_order}. ${d.title}`);
  });
}

checkValuePlusDefinitions().catch(console.error);
