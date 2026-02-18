const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'apps', 'backend', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Running Netcash columns migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '011_add_netcash_columns.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      
      // Try direct execution via REST API
      console.log('\n🔄 Trying alternative method...\n');
      
      // Split into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.includes('ALTER TABLE') || statement.includes('CREATE INDEX') || statement.includes('COMMENT ON') || statement.includes('UPDATE')) {
          console.log(`Executing: ${statement.substring(0, 60)}...`);
          
          const { error: execError } = await supabase.rpc('exec_sql', { 
            sql_query: statement + ';' 
          });
          
          if (execError) {
            console.log(`⚠️  ${execError.message}`);
          } else {
            console.log('✅ Success');
          }
        }
      }
    } else {
      console.log('✅ Migration completed successfully!');
    }

    // Verify the new columns
    console.log('\n📊 Verifying new columns...\n');
    
    const { data: members, error: queryError } = await supabase
      .from('members')
      .select('member_number, netcash_account_reference, debit_order_status, next_debit_date, failed_debit_count, total_arrears')
      .limit(5);

    if (queryError) {
      console.error('❌ Verification failed:', queryError.message);
    } else {
      console.log('Sample members with new columns:');
      console.table(members);
    }

    // Count members with netcash references
    const { count, error: countError } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .not('netcash_account_reference', 'is', null);

    if (!countError) {
      console.log(`\n✅ ${count} members have Netcash account references`);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

runMigration();
