/**
 * Test Products API
 * Run: node test-products-api.js
 */

const API_URL = 'http://localhost:3000/api/v1';

async function testProductsAPI() {
  console.log('🧪 Testing Products API...\n');

  try {
    // Test 1: Get all products
    console.log('1️⃣ GET /products - Fetch all products');
    const productsResponse = await fetch(`${API_URL}/products`);
    
    if (!productsResponse.ok) {
      console.log(`   ⚠️  Status: ${productsResponse.status} (Auth required)`);
    } else {
      const products = await productsResponse.json();
      console.log(`   ✅ Found ${products.length} products`);
      products.forEach(p => console.log(`      - ${p.name} (R${p.monthly_premium})`));
    }
    console.log('');

    // Test 2: Get benefit types
    console.log('2️⃣ GET /products/benefit-types/all - Fetch all benefit types');
    const benefitTypesResponse = await fetch(`${API_URL}/products/benefit-types/all`);
    
    if (!benefitTypesResponse.ok) {
      console.log(`   ⚠️  Status: ${benefitTypesResponse.status} (Auth required)`);
    } else {
      const benefitTypes = await benefitTypesResponse.json();
      console.log(`   ✅ Found ${benefitTypes.length} benefit types`);
      
      // Group by category
      const byCategory = {};
      benefitTypes.forEach(bt => {
        if (!byCategory[bt.category]) byCategory[bt.category] = [];
        byCategory[bt.category].push(bt);
      });
      
      Object.entries(byCategory).forEach(([category, types]) => {
        console.log(`      ${category}: ${types.length} types`);
      });
    }
    console.log('');

    // Test 3: Get product with benefits (using first product)
    console.log('3️⃣ GET /products/:id/with-benefits - Fetch product with benefits');
    
    // First get products to get an ID
    const productsForId = await fetch(`${API_URL}/products`);
    if (productsForId.ok) {
      const products = await productsForId.json();
      if (products.length > 0) {
        const productId = products[0].id;
        const productWithBenefitsResponse = await fetch(`${API_URL}/products/${productId}/with-benefits`);
        
        if (!productWithBenefitsResponse.ok) {
          console.log(`   ⚠️  Status: ${productWithBenefitsResponse.status} (Auth required)`);
        } else {
          const product = await productWithBenefitsResponse.json();
          console.log(`   ✅ ${product.name}`);
          console.log(`      Benefits configured: ${product.product_benefits?.length || 0}`);
        }
      }
    }
    console.log('');

    console.log('📝 API Endpoints Available:');
    console.log('   GET    /products - List all products');
    console.log('   GET    /products/:id - Get product by ID');
    console.log('   GET    /products/:id/with-benefits - Get product with benefits');
    console.log('   POST   /products - Create product');
    console.log('   PUT    /products/:id - Update product');
    console.log('   DELETE /products/:id - Delete product');
    console.log('');
    console.log('   GET    /products/benefit-types/all - List all benefit types');
    console.log('   GET    /products/benefit-types/category/:category - List by category');
    console.log('   GET    /products/:id/benefits - Get product benefits');
    console.log('   POST   /products/:id/benefits - Add/update product benefit');
    console.log('   DELETE /products/benefits/:benefitId - Delete product benefit');
    console.log('');
    console.log('   GET    /products/members/:memberId/usage/:year - Get member benefit usage');
    console.log('');

    console.log('⚠️  Note: Most endpoints require JWT authentication');
    console.log('   Use the /auth/login endpoint to get a token first\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testProductsAPI();
