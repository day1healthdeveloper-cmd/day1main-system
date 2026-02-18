require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  try {
    const { data: allProducts } = await supabase
      .from('products')
      .select('id, name, code, status')
      .order('name');

    console.log('All products in database:\n');
    allProducts.forEach((p, i) => {
      console.log(`${i + 1}. Name: "${p.name}"`);
      console.log(`   Code: "${p.code}"`);
      console.log(`   ID: ${p.id}`);
      console.log('');
    });

    // Check for specific names
    console.log('\nChecking for "Value Plus Plan":');
    const { data: vpp } = await supabase
      .from('products')
      .select('*')
      .eq('name', 'Value Plus Plan');
    console.log(vpp ? `Found ${vpp.length} matches` : 'Not found');

    console.log('\nChecking for "Executive Plan":');
    const { data: ep } = await supabase
      .from('products')
      .select('*')
      .eq('name', 'Executive Plan');
    console.log(ep ? `Found ${ep.length} matches` : 'Not found');

  } catch (error) {
    console.error('Error:', error);
  }
}

checkProducts();
