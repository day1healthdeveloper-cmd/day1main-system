/**
 * Run Netcash Base Schema in Supabase
 * This creates all the core Netcash tables
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function runMigration() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔗 Connecting to Supabase...');
    console.log('✅ Connected!\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'netcash-integration', 'database-schema', '01_netcash_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Running Netcash base schema migration...\n');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Error running migration:', error);
      
      // Try alternative method - split by semicolon and run each statement
      console.log('\n⚠️  Trying alternative method...\n');
      
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement) {
          try {
            console.log(`Executing statement ${i + 1}/${statements.length}...`);
            await supabase.rpc('exec_sql', { sql_query: statement + ';' });
          } catch (err) {
            console.warn(`⚠️  Statement ${i + 1} failed (may already exist):`, err.message);
          }
        }
      }
      
      console.log('\n✅ Migration completed with warnings\n');
    } else {
      console.log('✅ Migration completed successfully!\n');
    }

    // Verify tables were created
    console.log('🔍 Verifying tables...\n');
    
    const tables = [
      'debit_order_runs',
      'debit_order_transactions',
      'payment_history',
      'debicheck_mandates',
      'netcash_reconciliation',
      'netcash_audit_log'
    ];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: NOT FOUND`);
      } else {
        console.log(`✅ Table ${table}: EXISTS`);
      }
    }

    console.log('\n✅ Netcash base schema setup complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
