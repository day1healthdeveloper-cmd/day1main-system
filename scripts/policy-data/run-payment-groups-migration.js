/**
 * Run Payment Groups Migration
 * Run: node run-payment-groups-migration.js
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_SERVICE_KEY) throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY");

async function runMigration() {
  console.log('🚀 Running Payment Groups Migration...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../../supabase/migrations/018_payment_groups.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log(`📏 SQL length: ${sql.length} characters\n`);

    // Execute SQL via Supabase REST API (using RPC)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql_query: sql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('⚠️  Direct SQL execution not available via REST API');
      console.log('📋 Please run this migration manually in Supabase SQL Editor:\n');
      console.log('1. Go to: https://supabase.com/dashboard/project/ldygmpaipxbokxzyzyti/sql');
      console.log('2. Copy the SQL from: supabase/migrations/018_payment_groups.sql');
      console.log('3. Paste and run in SQL Editor\n');
      
      // Show first few lines of SQL
      const lines = sql.split('\n').slice(0, 20);
      console.log('Preview of SQL to run:');
      console.log('─'.repeat(60));
      console.log(lines.join('\n'));
      console.log('─'.repeat(60));
      console.log('... (see full file for complete SQL)\n');
      
      return;
    }

    console.log('✅ Migration executed successfully!\n');

  } catch (error) {
    console.error('❌ Migration Failed!\n');
    console.error('Error:', error.message);
    
    console.log('\n📋 Manual Migration Instructions:');
    console.log('1. Open Supabase SQL Editor');
    console.log('2. Copy SQL from: supabase/migrations/018_payment_groups.sql');
    console.log('3. Run the SQL\n');
    
    process.exit(1);
  }
}

runMigration();
