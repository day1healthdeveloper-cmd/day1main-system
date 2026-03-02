const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBenefitsData() {
  console.log('🔍 Checking benefits data...\n');

  // Check products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, regime, status')
    .order('name');

  if (productsError) {
    console.error('❌ Error fetching products:', productsError);
  } else {
    console.log(`✅ Found ${products.length} products:`);
    products.forEach(p => console.log(`   - ${p.name} (${p.status})`));
  }

  console.log('\n');

  // Check benefit_types table
  const { data: benefitTypes, error: btError } = await supabase
    .from('benefit_types')
    .select('*')
    .limit(5);

  if (btError) {
    console.error('❌ benefit_types table error:', btError.message);
    console.log('   Table may not exist. Need to run: docs/guides/SUPABASE_RUN_THIS_SQL.sql');
  } else {
    console.log(`✅ benefit_types table exists with ${benefitTypes?.length || 0} sample records`);
    if (benefitTypes && benefitTypes.length > 0) {
      benefitTypes.forEach(bt => console.log(`   - ${bt.code}: ${bt.name}`));
    }
  }

  console.log('\n');

  // Check product_benefits table
  const { data: productBenefits, error: pbError } = await supabase
    .from('product_benefits')
    .select('*')
    .limit(5);

  if (pbError) {
    console.error('❌ product_benefits table error:', pbError.message);
    console.log('   Table may not exist. Need to run: docs/guides/SUPABASE_RUN_THIS_SQL.sql');
  } else {
    console.log(`✅ product_benefits table exists`);
    
    // Count benefits per product
    const { data: benefitCounts } = await supabase
      .from('product_benefits')
      .select('product_id');
    
    if (benefitCounts && benefitCounts.length > 0) {
      console.log(`   Total product benefits configured: ${benefitCounts.length}`);
      
      // Group by product
      const grouped = benefitCounts.reduce((acc, pb) => {
        acc[pb.product_id] = (acc[pb.product_id] || 0) + 1;
        return acc;
      }, {});
      
      console.log(`   Products with benefits: ${Object.keys(grouped).length}`);
    } else {
      console.log('   ⚠️  No product benefits configured yet');
    }
  }

  console.log('\n');

  // Check benefit_usage table
  const { data: benefitUsage, error: buError } = await supabase
    .from('benefit_usage')
    .select('*')
    .limit(1);

  if (buError) {
    console.error('❌ benefit_usage table error:', buError.message);
  } else {
    console.log(`✅ benefit_usage table exists`);
  }

  console.log('\n📋 Summary:');
  console.log('   If tables don\'t exist, run: docs/guides/SUPABASE_RUN_THIS_SQL.sql');
  console.log('   If tables exist but no data, benefits need to be configured in Policy Creator');
}

checkBenefitsData().catch(console.error);
