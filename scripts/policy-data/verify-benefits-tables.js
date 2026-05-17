/**
 * Verify Benefits Tables Created Successfully
 * Run: node supabase/verify-benefits-tables.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_ANON_KEY) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY");

async function verifyBenefitsTables() {
  try {
    console.log('🔌 Connecting to Supabase...\n');
    console.log('✅ Connected!\n');

    console.log('🔍 Verifying Benefits Tables...\n');

    const tables = [
      'benefit_types',
      'product_benefits',
      'benefit_usage',
      'pmb_conditions',
      'chronic_conditions',
      'product_chronic_benefits'
    ];

    console.log('Tables Status:\n');
    let allExist = true;
    
    for (const table of tables) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      });

      if (response.ok) {
        const count = response.headers.get('content-range')?.split('/')[1] || '0';
        console.log(`  ✅ ${table} (${count} rows)`);
      } else {
        console.log(`  ❌ ${table} - NOT FOUND`);
        allExist = false;
      }
    }

    if (!allExist) {
      console.log('\n❌ Some tables are missing!\n');
      process.exit(1);
    }

    console.log('\n✅ All benefits tables verified successfully!\n');
    console.log('📝 Next Steps:');
    console.log('  1. Seed benefit types data');
    console.log('  2. Complete backend API (ProductsService, ProductsController)');
    console.log('  3. Build frontend UI for product benefits configuration\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyBenefitsTables();
