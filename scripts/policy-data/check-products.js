/**
 * Check products table structure and data
 */

require('dotenv').config({ path: '../apps/backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  console.log('🔍 Checking Products Table\n');
  console.log('='.repeat(60));

  try {
    // Get all products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log(`\n✅ Found ${products.length} products\n`);

    if (products.length > 0) {
      console.log('📋 Products:');
      products.forEach((product, i) => {
        console.log(`\n${i + 1}. ${product.name || 'Unnamed'}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Columns:`, Object.keys(product).join(', '));
        console.log(`   Data:`, JSON.stringify(product, null, 2));
      });
    } else {
      console.log('ℹ️  No products found in database');
      console.log('\n📊 Table Structure:');
      console.log('   Run this query to see columns:');
      console.log('   SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'products\'');
    }

    // Try to get table schema
    console.log('\n🔍 Attempting to describe table structure...');
    const { data: schema, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'products' })
      .single();

    if (!schemaError && schema) {
      console.log('✅ Schema:', schema);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProducts();
