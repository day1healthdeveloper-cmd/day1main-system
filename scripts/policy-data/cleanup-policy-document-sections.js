const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
  console.log('🧹 Cleaning up policy_document_sections table...\n');

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

  // Check what's in there first
  const { data: before, error: beforeError } = await supabase
    .from('policy_document_sections')
    .select('*')
    .eq('product_id', product.id);

  if (beforeError) {
    console.error('❌ Error checking table:', beforeError);
    return;
  }

  console.log(`📊 Found ${before.length} rows to delete\n`);

  if (before.length === 0) {
    console.log('✅ Table is already clean!');
    return;
  }

  // Delete all rows for this product
  const { error: deleteError } = await supabase
    .from('policy_document_sections')
    .delete()
    .eq('product_id', product.id);

  if (deleteError) {
    console.error('❌ Error deleting:', deleteError);
    return;
  }

  console.log(`✅ Successfully deleted ${before.length} rows from policy_document_sections`);
  console.log('✅ Cleanup complete!\n');
}

cleanup();
