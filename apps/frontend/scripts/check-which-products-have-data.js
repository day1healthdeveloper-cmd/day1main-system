const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProductsData() {
  console.log('🔍 Checking which products have policy data...\n');

  // Get all products
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .order('name');

  if (!products) {
    console.log('No products found');
    return;
  }

  console.log(`Found ${products.length} products:\n`);

  for (const product of products) {
    // Check policy_section_items
    const { data: items, count } = await supabase
      .from('policy_section_items')
      .select('*', { count: 'exact' })
      .eq('product_id', product.id);

    // Check policy_sections
    const { data: sections, count: sectionsCount } = await supabase
      .from('policy_sections')
      .select('*', { count: 'exact' })
      .eq('product_id', product.id);

    console.log(`📦 ${product.name}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Policy Section Items: ${count || 0}`);
    console.log(`   Policy Sections: ${sectionsCount || 0}`);
    
    if (items && items.length > 0) {
      const sectionTypes = [...new Set(items.map(i => i.section_type))];
      console.log(`   Section Types: ${sectionTypes.join(', ')}`);
    }
    
    console.log('');
  }
}

checkProductsData().catch(console.error);
