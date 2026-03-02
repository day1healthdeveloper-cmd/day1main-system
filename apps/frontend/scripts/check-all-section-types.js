const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllSectionTypes() {
  console.log('🔍 Checking all section types across all products...\n');

  // Get all products
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('status', 'published')
    .order('name');

  if (!products || products.length === 0) {
    console.log('❌ No products found');
    return;
  }

  console.log(`📦 Found ${products.length} products\n`);

  // Get all unique section types
  const { data: allItems } = await supabase
    .from('policy_section_items')
    .select('section_type, product_id');

  const sectionTypesByProduct = {};
  const allSectionTypes = new Set();

  allItems?.forEach(item => {
    allSectionTypes.add(item.section_type);
    if (!sectionTypesByProduct[item.product_id]) {
      sectionTypesByProduct[item.product_id] = new Set();
    }
    sectionTypesByProduct[item.product_id].add(item.section_type);
  });

  console.log('📋 All unique section types found:');
  Array.from(allSectionTypes).sort().forEach(type => {
    console.log(`   - ${type}`);
  });

  console.log('\n\n📊 Section types by product:\n');

  for (const product of products) {
    const sections = sectionTypesByProduct[product.id] || new Set();
    console.log(`${product.name}:`);
    if (sections.size === 0) {
      console.log('   ❌ No sections');
    } else {
      Array.from(sections).sort().forEach(type => {
        console.log(`   ✓ ${type}`);
      });
    }
    console.log('');
  }

  // Check if ANY product has "definitions" section
  const hasDefinitions = Array.from(allSectionTypes).includes('definitions');
  console.log(`\n🔍 Does any product have "definitions" section? ${hasDefinitions ? '✅ YES' : '❌ NO'}`);
}

checkAllSectionTypes().catch(console.error);
