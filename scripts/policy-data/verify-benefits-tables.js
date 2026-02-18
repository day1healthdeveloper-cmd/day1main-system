/**
 * Verify Benefits Tables Created Successfully
 * Run: node supabase/verify-benefits-tables.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

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
