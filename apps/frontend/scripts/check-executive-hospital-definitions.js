const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDefinitions() {
  console.log('🔍 Checking Executive Hospital Plan definitions...\n');

  // Get Executive Hospital Plan product
  const { data: product } = await supabase
    .from('products')
    .select('id, name')
    .eq('name', 'Executive Hospital Plan')
    .single();

  if (!product) {
    console.log('❌ Executive Hospital Plan not found');
    return;
  }

  console.log(`✅ Found: ${product.name}`);
  console.log(`   ID: ${product.id}\n`);

  // Check definitions
  const { data: definitions, error } = await supabase
    .from('policy_section_items')
    .select('*')
    .eq('product_id', product.id)
    .eq('section_type', 'definitions')
    .order('display_order');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📋 Definitions found: ${definitions?.length || 0}\n`);

  if (definitions && definitions.length > 0) {
    console.log('First 5 definitions:');
    definitions.slice(0, 5).forEach((def, idx) => {
      console.log(`\n${idx + 1}. ${def.title}`);
      console.log(`   ${def.content.substring(0, 100)}...`);
    });
  }
}

checkDefinitions().catch(console.error);
