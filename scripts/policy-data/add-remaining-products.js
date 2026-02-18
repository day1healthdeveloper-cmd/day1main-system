const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const newProducts = [
  {
    name: 'Executive Junior Hospital Plan',
    code: 'executive-junior',
    regime: 'insurance',
    description: 'Comprehensive hospital plan for children and young adults',
    monthly_premium: 0,
    cover_amount: 0,
    status: 'published'
  },
  {
    name: 'Senior Comprehensive Hospital Plan',
    code: 'senior-comprehensive',
    regime: 'insurance',
    description: 'Comprehensive hospital plan for seniors',
    monthly_premium: 0,
    cover_amount: 0,
    status: 'published'
  }
];

async function addProducts() {
  console.log('🔗 Connecting to Supabase...\n');

  for (const product of newProducts) {
    console.log(`📦 Adding: ${product.name}`);
    
    // Check if product already exists
    const { data: existing } = await supabase
      .from('products')
      .select('id, name')
      .eq('name', product.name)
      .single();

    if (existing) {
      console.log(`   ⚠️  Already exists (ID: ${existing.id})\n`);
      continue;
    }

    // Insert new product
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error(`   ❌ Error:`, error.message);
    } else {
      console.log(`   ✅ Created (ID: ${data.id})`);
    }
    console.log('');
  }

  console.log('✅ Done! All products processed.\n');

  // Show final list
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, status')
    .order('name');

  console.log('📋 Current Products:\n');
  allProducts.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} (${p.status})`);
  });
}

addProducts();
