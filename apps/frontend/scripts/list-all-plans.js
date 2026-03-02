const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listAllPlans() {
  const { data: products } = await supabase
    .from('products')
    .select('id, name, status')
    .eq('status', 'published')
    .order('name');

  console.log('='.repeat(80));
  console.log('ALL 9 INSURANCE PLANS IN DATABASE');
  console.log('='.repeat(80));
  
  products.forEach((p, i) => {
    console.log(`\n${i+1}. ${p.name}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Status: ${p.status}`);
  });
  
  console.log('\n' + '='.repeat(80));
}

listAllPlans().catch(console.error);
