const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testProducts() {
  console.log('🔍 Testing products table...\n');
  
  // First, get one product to see the structure
  const { data: sample, error: sampleError } = await supabase
    .from('products')
    .select('*')
    .limit(1)
    .single();

  if (sampleError) {
    console.error('❌ Error:', sampleError);
    return;
  }

  console.log('Sample product structure:');
  console.log(JSON.stringify(sample, null, 2));
  console.log('\nColumns:', Object.keys(sample));
  
  // Now get all products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'published')
    .order('name');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`\n✅ Found ${products.length} published products:\n`);
  products.forEach(p => {
    console.log(`  ${p.name} (ID: ${p.id})`);
  });
}

testProducts().catch(console.error);
