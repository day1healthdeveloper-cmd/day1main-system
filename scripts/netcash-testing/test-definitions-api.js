/**
 * Test if definitions are accessible via Supabase
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function test() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('Testing definitions API...\n');
  
  // Get product
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('name', 'Executive Hospital Plan')
    .limit(1);
  
  if (!products || products.length === 0) {
    console.log('❌ Product not found');
    return;
  }
  
  const productId = products[0].id;
  console.log(`✅ Product: ${products[0].name}`);
  console.log(`   ID: ${productId}\n`);
  
  // Get definitions
  const { data: definitions, error } = await supabase
    .from('policy_definitions')
    .select('*')
    .eq('product_id', productId)
    .order('display_order', { ascending: true });
  
  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }
  
  console.log(`✅ Found ${definitions.length} definitions:\n`);
  
  definitions.slice(0, 5).forEach(def => {
    console.log(`  ${def.display_order}. ${def.term} (${def.category})`);
  });
  
  if (definitions.length > 5) {
    console.log(`  ... and ${definitions.length - 5} more\n`);
  }
  
  console.log('\n✅ Data is in database!');
  console.log('   Backend needs to be restarted to serve this data.\n');
}

test();
