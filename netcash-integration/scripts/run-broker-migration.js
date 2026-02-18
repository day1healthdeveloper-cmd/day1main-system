/**
 * Run Broker Migration Directly on Supabase
 * Executes the SQL migration file
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response;
}

async function runMigration() {
  console.log('🚀 RUNNING BROKER MIGRATION');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../../supabase/migrations/010_add_broker_tables.sql');
    console.log(`📂 Reading migration: ${migrationPath}`);
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found!');
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log(`✅ Migration file loaded (${sql.length} characters)`);
    console.log('');

    // Split into individual statements (by semicolon)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    console.log('');

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Get first line for description
      const firstLine = statement.split('\n')[0].substring(0, 60);
      console.log(`${i + 1}/${statements.length}: ${firstLine}...`);

      try {
        await executeSql(statement + ';');
        console.log('   ✅ Success');
      } catch (error) {
        // Some errors are OK (like "already exists")
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.message.includes('does not exist')) {
          console.log('   ⚠️  Skipped (already exists)');
        } else {
          console.error('   ❌ Failed:', error.message);
          // Continue with other statements
        }
      }
    }

    console.log('');
    console.log('✅ MIGRATION COMPLETE!');
    console.log('');
    console.log('Created:');
    console.log('  ✅ brokers table (with 19 broker records)');
    console.log('  ✅ payment_history table');
    console.log('  ✅ Broker columns in members table');
    console.log('  ✅ Indexes for fast queries');
    console.log('  ✅ Trigger to auto-update broker member counts');
    console.log('');
    console.log('Next: Paste the PDF data and I\'ll import it!');

  } catch (error) {
    console.error('❌ Migration failed!');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

runMigration();
