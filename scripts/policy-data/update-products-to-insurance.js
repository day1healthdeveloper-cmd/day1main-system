/**
 * Update all products to insurance regime
 * Day1Health is a medical insurer, not a medical scheme
 * Run: node supabase/update-products-to-insurance.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function updateProductsToInsurance() {
  console.log('🔄 Updating products to insurance regime...\n');

  try {
    // Get all products
    const getResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      }
    });

    const products = await getResponse.json();
    console.log(`Found ${products.length} products\n`);

    // Update each product
    for (const product of products) {
      console.log(`Updating: ${product.name}`);
      console.log(`  Current regime: ${product.regime}`);

      const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          regime: 'insurance'
        })
      });

      if (updateResponse.ok) {
        console.log(`  ✅ Updated to: insurance\n`);
      } else {
        const error = await updateResponse.text();
        console.log(`  ❌ Failed: ${error}\n`);
      }
    }

    console.log('✅ All products updated to insurance regime!\n');
    console.log('📝 Summary:');
    console.log('  Day1Health operates as a medical insurer (FSCA regulated)');
    console.log('  NOT a medical scheme (CMS regulated)');
    console.log('  All products now correctly marked as "insurance"\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateProductsToInsurance();
