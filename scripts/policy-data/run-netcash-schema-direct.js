/**
 * Run Netcash Schema Directly via SQL
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function runSchema() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔗 Connecting to Supabase...');
    console.log('✅ Connected!\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'netcash-integration', 'database-schema', '01_netcash_tables.sql');
    const fullSql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Creating Netcash tables...\n');

    // Split into individual statements and execute
    const statements = fullSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      try {
        // Use the REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ query: statement + ';' })
        });

        if (response.ok) {
          successCount++;
          console.log(`✅ Statement ${i + 1}/${statements.length}`);
        } else {
          const error = await response.text();
          if (error.includes('already exists') || error.includes('duplicate')) {
            skipCount++;
            console.log(`⏭️  Statement ${i + 1}/${statements.length} (already exists)`);
          } else {
            errorCount++;
            console.log(`❌ Statement ${i + 1}/${statements.length}: ${error.substring(0, 100)}`);
          }
        }
      } catch (err) {
        errorCount++;
        console.log(`❌ Statement ${i + 1}/${statements.length}: ${err.message}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    // Verify tables
    console.log('\n🔍 Verifying tables...\n');
    
    const tables = [
      'debit_order_runs',
      'debit_order_transactions',
      'payment_history',
      'debicheck_mandates',
      'netcash_reconciliation',
      'netcash_audit_log'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: NOT FOUND`);
        } else {
          console.log(`✅ ${table}: EXISTS`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ERROR - ${err.message}`);
      }
    }

    console.log('\n✅ Schema setup complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runSchema();
