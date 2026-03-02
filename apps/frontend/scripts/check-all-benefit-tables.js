const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTable(tableName) {
  const { data, error, count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log(`❌ ${tableName}: Does not exist or error - ${error.message}`);
    return null;
  } else {
    console.log(`✅ ${tableName}: Exists with ${count || 0} records`);
    return count;
  }
}

async function checkAllBenefitTables() {
  console.log('🔍 Checking all benefit-related tables...\n');

  const tables = [
    // Structured benefits system
    'benefit_types',
    'product_benefits',
    'benefit_usage',
    'product_chronic_benefits',
    'benefit_details',
    'benefit_exclusions',
    'benefit_conditions',
    'benefit_network_providers',
    'benefit_procedure_codes',
    'benefit_authorization_rules',
    'benefit_change_history',
    'benefit_plan_documents',
    
    // Policy document system
    'policy_sections',
    'policy_section_items',
    'policy_document_sections',
    
    // Other related
    'products',
    'policies',
  ];

  console.log('📊 Table Status:\n');
  
  for (const table of tables) {
    await checkTable(table);
  }

  console.log('\n');

  // Check policy_section_items in detail
  const { data: sectionItems, error: siError } = await supabase
    .from('policy_section_items')
    .select('product_id, section_type')
    .limit(100);

  if (!siError && sectionItems && sectionItems.length > 0) {
    console.log('\n📄 Policy Section Items by Product:');
    const grouped = sectionItems.reduce((acc, item) => {
      if (!acc[item.product_id]) acc[item.product_id] = {};
      acc[item.product_id][item.section_type] = (acc[item.product_id][item.section_type] || 0) + 1;
      return acc;
    }, {});

    // Get product names
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', Object.keys(grouped));

    if (products) {
      products.forEach(p => {
        console.log(`\n   ${p.name}:`);
        const sections = grouped[p.id];
        Object.entries(sections).forEach(([type, count]) => {
          console.log(`      - ${type}: ${count} items`);
        });
      });
    }
  }

  // Check policy_sections in detail
  const { data: sections, error: secError } = await supabase
    .from('policy_sections')
    .select('product_id, section_type, content')
    .limit(100);

  if (!secError && sections && sections.length > 0) {
    console.log('\n\n📋 Policy Sections by Product:');
    const grouped = sections.reduce((acc, item) => {
      if (!acc[item.product_id]) acc[item.product_id] = [];
      acc[item.product_id].push(item.section_type);
      return acc;
    }, {});

    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', Object.keys(grouped));

    if (products) {
      products.forEach(p => {
        console.log(`\n   ${p.name}:`);
        console.log(`      Sections: ${grouped[p.id].join(', ')}`);
      });
    }
  }
}

checkAllBenefitTables().catch(console.error);
