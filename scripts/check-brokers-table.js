const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBrokersTable() {
  console.log('🔍 Checking brokers table structure...\n');

  // Try direct query to see what columns exist
  const { data: brokers, error } = await supabase
    .from('brokers')
    .select('*')
    .limit(5);

  if (error) {
    console.error('❌ Error querying brokers table:', error.message);
    console.log('\n⚠️  Brokers table may not exist or has permission issues');
    console.log('Run the BROKER_MIGRATION_SQL.sql script in Supabase SQL Editor');
    return;
  }

  console.log('✅ Brokers table exists!\n');
  console.log(`📊 Found ${brokers?.length || 0} broker records\n`);

  if (brokers && brokers.length > 0) {
    console.log('📋 Table columns:');
    const sampleBroker = brokers[0];
    Object.keys(sampleBroker).forEach(col => {
      const value = sampleBroker[col];
      const type = typeof value;
      console.log(`  - ${col} (${type})`);
    });

    console.log('\n📝 Sample brokers:');
    brokers.forEach(broker => {
      console.log(`  ${broker.code || broker.id}: ${broker.name || 'N/A'}`);
    });
  } else {
    console.log('⚠️  No broker records found. Run the INSERT statements from BROKER_MIGRATION_SQL.sql');
  }

  // Count total brokers
  const { count, error: countError } = await supabase
    .from('brokers')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log(`\n📈 Total brokers in database: ${count}`);
  }
}

checkBrokersTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
