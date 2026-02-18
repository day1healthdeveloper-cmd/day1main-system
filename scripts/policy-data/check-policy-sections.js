const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSections() {
  console.log('🔍 Checking policy document sections...\n');

  const { data: product } = await supabase
    .from('products')
    .select('id, name')
    .eq('name', 'Platinum Hospital Plan')
    .single();

  if (!product) {
    console.error('❌ Product not found');
    return;
  }

  console.log(`📦 Product: ${product.name}`);
  console.log(`📦 Product ID: ${product.id}\n`);

  const { data: sections, error } = await supabase
    .from('policy_document_sections')
    .select('*')
    .eq('product_id', product.id)
    .order('section_order');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Total sections: ${sections.length}\n`);

  // Group by section type
  const grouped = {};
  sections.forEach(section => {
    const type = section.section_id.split('_')[0];
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(section);
  });

  Object.keys(grouped).sort().forEach(type => {
    console.log(`\n${type}: ${grouped[type].length} items`);
    grouped[type].forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.section_title} (${s.section_id})`);
    });
  });
}

checkSections();
