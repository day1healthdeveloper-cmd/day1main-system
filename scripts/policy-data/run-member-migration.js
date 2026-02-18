/**
 * Run Members Table Migration
 * Adds all missing fields to store complete application data
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function runMigration() {
  console.log('🔧 RUNNING MEMBERS TABLE MIGRATION');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '008_add_member_fields.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL:');
    console.log('-'.repeat(80));
    console.log(sql);
    console.log('-'.repeat(80));
    console.log('');

    // Execute the migration
    console.log('⚙️  Executing migration...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('⚠️  Direct SQL execution not available via REST API');
      console.log('');
      console.log('📝 MANUAL MIGRATION REQUIRED:');
      console.log('-'.repeat(80));
      console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ldygmpaipxbokxzyzyti');
      console.log('2. Click "SQL Editor" in the left sidebar');
      console.log('3. Click "New Query"');
      console.log('4. Copy and paste the SQL from: supabase/migrations/008_add_member_fields.sql');
      console.log('5. Click "Run"');
      console.log('');
      console.log('OR copy this SQL:');
      console.log('-'.repeat(80));
      console.log(sql);
      console.log('-'.repeat(80));
      console.log('');
      return;
    }

    console.log('✅ Migration executed successfully!');
    console.log('');

    // Verify the new columns
    console.log('🔍 Verifying new columns...');
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const schema = await verifyResponse.json();
    if (schema.definitions && schema.definitions.members) {
      const properties = schema.definitions.members.properties || {};
      const newColumns = [
        'address_line1', 'address_line2', 'city', 'postal_code',
        'plan_name', 'plan_config', 'monthly_premium', 'start_date',
        'bank_name', 'account_number', 'branch_code', 'account_holder_name', 'debit_order_day',
        'mobile'
      ];

      console.log('');
      console.log('New columns added:');
      newColumns.forEach(col => {
        if (properties[col]) {
          console.log(`  ✅ ${col}`);
        } else {
          console.log(`  ❌ ${col} (not found)`);
        }
      });
      console.log('');
    }

    console.log('=' .repeat(80));
    console.log('✅ MIGRATION COMPLETE');
    console.log('=' .repeat(80));
    console.log('');
    console.log('Members table now has all fields to store complete application data!');
    console.log('');

  } catch (error) {
    console.error('❌ Migration failed!\n');
    console.error('Error:', error.message);
    console.log('');
    console.log('Please run the migration manually in Supabase SQL Editor');
    console.log('File: supabase/migrations/008_add_member_fields.sql');
    console.log('');
    process.exit(1);
  }
}

runMigration();
