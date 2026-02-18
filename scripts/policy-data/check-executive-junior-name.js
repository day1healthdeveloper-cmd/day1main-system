require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProduct() {
  try {
    // Check for products with "Executive Junior" in the name
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .or('name.ilike.%Executive Junior%,code.eq.executive-junior');

    console.log('Products matching "Executive Junior":');
    products.forEach(p => {
      console.log(`\nID: ${p.id}`);
      console.log(`Name: "${p.name}"`);
      console.log(`Code: "${p.code}"`);
      console.log(`Status: ${p.status}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkProduct();
