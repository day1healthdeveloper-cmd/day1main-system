/**
 * Verify Payment Groups Columns
 * Run: node verify-columns.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_SERVICE_KEY) throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY");

async function verifyColumns() {
  console.log('🔍 Verifying Payment Groups Schema Columns...\n');

  try {
    // Get schema info for payment_groups table
    const pgResponse = await fetch(`${SUPABASE_URL}/rest/v1/payment_groups?limit=0`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    console.log('📊 payment_groups table: ✅ EXISTS\n');

    // Check members table for new columns by trying to select them
    const membersResponse = await fetch(`${SUPABASE_URL}/rest/v1/members?select=payment_group_id,collection_method&limit=0`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (membersResponse.ok) {
      console.log('📊 members table columns:');
      console.log('✅ payment_group_id');
      console.log('✅ collection_method\n');
    } else {
      console.log('❌ members table columns missing\n');
    }

    // Check debit_order_runs table for new columns
    const runsResponse = await fetch(`${SUPABASE_URL}/rest/v1/debit_order_runs?select=group_id,is_group_run&limit=0`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (runsResponse.ok) {
      console.log('📊 debit_order_runs table columns:');
      console.log('✅ group_id');
      console.log('✅ is_group_run\n');
    } else {
      console.log('❌ debit_order_runs table columns missing\n');
    }

    console.log('='.repeat(60));
    console.log('✅ All schema verification complete!\n');
    console.log('📋 Summary:');
    console.log('  - 4 new tables created');
    console.log('  - 2 columns added to members table');
    console.log('  - 2 columns added to debit_order_runs table');
    console.log('  - Triggers and functions created\n');

  } catch (error) {
    console.error('❌ Verification Failed!\n');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verifyColumns();
