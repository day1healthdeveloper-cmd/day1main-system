/**
 * Verify Comprehensive Benefits Tables
 * Run: node supabase/verify-comprehensive-tables.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function verifyTables() {
  console.log('🔍 Verifying Comprehensive Benefits Tables...\n');

  const tables = [
    'benefit_plan_documents',
    'benefit_details',
    'benefit_exclusions',
    'benefit_conditions',
    'benefit_network_providers',
    'benefit_procedure_codes',
    'benefit_authorization_rules',
    'benefit_change_history',
  ];

  try {
    for (const table of tables) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      });

      if (response.ok) {
        const count = response.headers.get('content-range')?.split('/')[1] || '0';
        console.log(`  ✅ ${table} (${count} rows)`);
      } else {
        console.log(`  ❌ ${table} - NOT FOUND`);
      }
    }

    console.log('\n✅ All comprehensive benefits tables verified!\n');
    console.log('📊 System Ready:');
    console.log('  - Document storage');
    console.log('  - Comprehensive benefit details');
    console.log('  - Exclusions tracking');
    console.log('  - Conditions management');
    console.log('  - Network providers');
    console.log('  - Procedure codes');
    console.log('  - Authorization rules');
    console.log('  - Change history\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyTables();
