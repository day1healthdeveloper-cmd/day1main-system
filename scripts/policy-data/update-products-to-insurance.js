/**
 * Update all products to insurance regime
 * Day1Health is a medical insurer, not a medical scheme
 * Run: node supabase/update-products-to-insurance.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_ANON_KEY) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY");

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
