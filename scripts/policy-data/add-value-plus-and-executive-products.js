require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
  {
    name: 'Value Plus Plan',
    code: 'valueplus-plan',
    regime: 'insurance',
    description: 'Comprehensive hospital plan with extensive coverage',
    status: 'published'
  },
  {
    name: 'Executive Plan',
    code: 'executive-plan',
    regime: 'insurance',
    description: 'Premium executive hospital plan',
    status: 'published'
  }
];

async function addProducts() {
  try {
    console.log('Adding new products...\n');

    for (const product of products) {
      // Check if product already exists by name
      const { data: existing } = await supabase
        .from('products')
        .select('id, name')
        .eq('name', product.name)
        .single();

      if (existing) {
        console.log(`⚠️  Product "${product.name}" already exists (ID: ${existing.id})`);
        continue;
      }

      // Insert new product
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error inserting ${product.name}:`, error);
      } else {
        console.log(`✅ Added: ${product.name} (ID: ${data.id})`);
      }
    }

    console.log('\n✅ Product addition complete!');
    
    // List all products
    console.log('\nAll products in system:');
    const { data: allProducts } = await supabase
      .from('products')
      .select('id, name, code, status')
      .order('name');

    allProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (${p.code}) - ${p.status}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

addProducts();
