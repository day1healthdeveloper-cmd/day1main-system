const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPlatinumPlanData() {
  console.log('🔍 Checking Platinum Plan data...\n');

  // Get Platinum Plan product
  const { data: product } = await supabase
    .from('products')
    .select('id, name')
    .eq('name', 'Platinum Plan')
    .single();

  if (!product) {
    console.log('❌ Platinum Plan not found');
    return;
  }

  console.log(`✅ Found: ${product.name}`);
  console.log(`   ID: ${product.id}\n`);

  // Check policy_section_items grouped by section_type
  const { data: items } = await supabase
    .from('policy_section_items')
    .select('*')
    .eq('product_id', product.id)
    .order('section_type')
    .order('display_order');

  if (!items || items.length === 0) {
    console.log('❌ No policy section items found');
    return;
  }

  console.log(`📄 Total items: ${items.length}\n`);

  // Group by section type
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.section_type]) {
      acc[item.section_type] = [];
    }
    acc[item.section_type].push(item);
    return acc;
  }, {});

  // Display each section
  Object.entries(grouped).forEach(([sectionType, sectionItems]) => {
    console.log(`\n📋 ${sectionType.toUpperCase()} (${sectionItems.length} items):`);
    sectionItems.slice(0, 3).forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.title}`);
      if (item.content) {
        const preview = item.content.substring(0, 100);
        console.log(`      ${preview}${item.content.length > 100 ? '...' : ''}`);
      }
    });
    if (sectionItems.length > 3) {
      console.log(`   ... and ${sectionItems.length - 3} more items`);
    }
  });

  // Check if there's a definitions section
  console.log('\n\n🔍 Checking for definitions specifically:');
  const definitionsItems = items.filter(i => 
    i.section_type === 'definitions' || 
    i.section_type === 'definition' ||
    i.title?.toLowerCase().includes('definition')
  );
  
  if (definitionsItems.length > 0) {
    console.log(`✅ Found ${definitionsItems.length} definition items`);
    definitionsItems.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.title} (section: ${item.section_type})`);
    });
  } else {
    console.log('❌ No definitions found in policy_section_items');
    console.log('   Definitions might be stored in a separate table or not entered yet');
  }
}

checkPlatinumPlanData().catch(console.error);
