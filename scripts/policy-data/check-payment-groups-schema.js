/**
 * Check Payment Groups Schema
 * Run: node check-payment-groups-schema.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function checkSchema() {
  console.log('🔍 Checking Payment Groups Schema...\n');

  try {
    // Check if payment_groups table exists
    const tablesResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const schema = await tablesResponse.json();
    const tables = Object.keys(schema.definitions || {});

    console.log('📊 Checking Required Tables:\n');
    
    const requiredTables = [
      'payment_groups',
      'group_payment_history',
      'group_member_payments',
      'eft_payment_notifications'
    ];

    const existingTables = [];
    const missingTables = [];

    for (const table of requiredTables) {
      if (tables.includes(table)) {
        console.log(`✅ ${table} - EXISTS`);
        existingTables.push(table);
      } else {
        console.log(`❌ ${table} - MISSING`);
        missingTables.push(table);
      }
    }

    // Check members table columns
    console.log('\n📊 Checking Members Table Columns:\n');
    
    const membersResponse = await fetch(`${SUPABASE_URL}/rest/v1/members?limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const members = await membersResponse.json();
    
    const requiredColumns = [
      'payment_group_id',
      'collection_method',
      'netcash_group_id'
    ];

    if (members.length > 0) {
      const member = members[0];
      const existingColumns = Object.keys(member);
      
      for (const col of requiredColumns) {
        if (existingColumns.includes(col)) {
          console.log(`✅ members.${col} - EXISTS`);
        } else {
          console.log(`❌ members.${col} - MISSING`);
        }
      }
    } else {
      console.log('⚠️  No members in table, cannot check columns');
    }

    // Check debit_order_runs columns
    console.log('\n📊 Checking Debit Order Runs Table Columns:\n');
    
    const runsResponse = await fetch(`${SUPABASE_URL}/rest/v1/debit_order_runs?limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const runs = await runsResponse.json();
    
    const requiredRunColumns = [
      'group_id',
      'is_group_run'
    ];

    if (runs.length > 0) {
      const run = runs[0];
      const existingColumns = Object.keys(run);
      
      for (const col of requiredRunColumns) {
        if (existingColumns.includes(col)) {
          console.log(`✅ debit_order_runs.${col} - EXISTS`);
        } else {
          console.log(`❌ debit_order_runs.${col} - MISSING`);
        }
      }
    } else {
      console.log('⚠️  No runs in table, checking via schema...');
    }

    console.log('\n' + '='.repeat(60));
    
    if (missingTables.length === 0) {
      console.log('✅ All required tables exist!');
    } else {
      console.log(`⚠️  ${missingTables.length} tables missing - migration needed`);
    }

  } catch (error) {
    console.error('❌ Check Failed!\n');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
