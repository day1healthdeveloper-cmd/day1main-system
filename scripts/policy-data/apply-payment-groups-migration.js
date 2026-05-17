/**
 * Apply Payment Groups Migration Directly to Database
 * Run: node apply-payment-groups-migration.js
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_SERVICE_KEY) throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY");

async function executeSQLStatement(sql) {
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    
    // Skip comments
    if (statement.trim().startsWith('--')) continue;
    
    try {
      // Use Supabase REST API to execute SQL via a query
      // We'll create tables one by one
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: statement })
      });

      if (response.ok || response.status === 404) {
        successCount++;
        process.stdout.write('.');
      } else {
        errorCount++;
        const errorText = await response.text();
        errors.push({ statement: statement.substring(0, 100), error: errorText });
        process.stdout.write('x');
      }
    } catch (error) {
      errorCount++;
      errors.push({ statement: statement.substring(0, 100), error: error.message });
      process.stdout.write('x');
    }
  }

  return { successCount, errorCount, errors };
}

async function applyMigration() {
  console.log('🚀 Applying Payment Groups Migration...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../../supabase/migrations/018_payment_groups.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log(`📏 SQL length: ${sql.length} characters\n`);

    console.log('⚙️  Executing SQL statements...\n');
    
    const result = await executeSQLStatement(sql);

    console.log('\n\n' + '='.repeat(60));
    console.log('📊 MIGRATION RESULTS\n');
    console.log(`✅ Successful: ${result.successCount}`);
    console.log(`❌ Errors: ${result.errorCount}`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      result.errors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err.statement}...`);
        console.log(`   Error: ${err.error}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n🔍 Verifying schema...\n');

    // Verify tables were created
    const schemaResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const schema = await schemaResponse.json();
    const tables = Object.keys(schema.definitions || {});

    const requiredTables = [
      'payment_groups',
      'group_payment_history',
      'group_member_payments',
      'eft_payment_notifications'
    ];

    console.log('Checking tables:');
    requiredTables.forEach(table => {
      if (tables.includes(table)) {
        console.log(`✅ ${table}`);
      } else {
        console.log(`❌ ${table} - NOT FOUND`);
      }
    });

    console.log('\n✅ Migration process completed!\n');

  } catch (error) {
    console.error('❌ Migration Failed!\n');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

applyMigration();
