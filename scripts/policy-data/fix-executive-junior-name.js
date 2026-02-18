require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProductName() {
  try {
    // Update the product name
    const { data, error } = await supabase
      .from('products')
      .update({ name: 'Executive Junior Plan' })
      .eq('name', 'Executive Junior Hospital Plan')
      .select();

    if (error) {
      console.error('Error updating product name:', error);
    } else {
      console.log('✅ Updated product name from "Executive Junior Hospital Plan" to "Executive Junior Plan"');
      console.log('Product ID:', data[0]?.id);
    }

    // List all products to confirm
    const { data: allProducts } = await supabase
      .from('products')
      .select('id, name, code')
      .order('name');

    console.log('\nAll products:');
    allProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (${p.code})`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

fixProductName();
