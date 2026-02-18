/**
 * Check for benefits/product_benefits tables
 */

require('dotenv').config({ path: '../apps/backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBenefits() {
  console.log('🔍 Checking Benefits Tables\n');
  console.log('='.repeat(60));

  const tablesToCheck = [
    'benefits',
    'product_benefits',
    'benefit_limits',
    'benefit_rules',
    'plan_benefits',
  ];

  for (const tableName of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: false })
        .limit(5);

      if (error) {
        console.log(`❌ ${tableName}: Does not exist or no access`);
      } else {
        console.log(`✅ ${tableName}: EXISTS with ${count} records`);
        if (data && data.length > 0) {
          console.log(`   Columns:`, Object.keys(data[0]).join(', '));
          console.log(`   Sample:`, JSON.stringify(data[0], null, 2));
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName}: Error - ${err.message}`);
    }
    console.log('');
  }
}

checkBenefits();
