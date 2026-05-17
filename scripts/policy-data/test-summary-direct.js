/**
 * Test Summary Query Directly
 * Run: node test-summary-direct.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_ANON_KEY) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY");

async function testSummaryQuery() {
  console.log('🔍 Testing Summary Query...\n');

  try {
    // Query members table
    console.log('📊 Querying members table for summary...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/members?select=broker_group,debit_order_status,monthly_premium,total_arrears`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const members = await response.json();
    console.log(`✅ Found ${members.length} members\n`);

    if (members.length === 0) {
      console.log('❌ No members found in database!');
      return;
    }

    // Calculate summary
    const summary = {
      total: members.length,
      totalPremium: members.reduce((sum, m) => sum + (m.monthly_premium || 0), 0),
      totalArrears: members.reduce((sum, m) => sum + (m.total_arrears || 0), 0),
      byBroker: {},
      byStatus: {},
    };

    members.forEach(m => {
      // By broker
      if (!summary.byBroker[m.broker_group]) {
        summary.byBroker[m.broker_group] = {
          count: 0,
          premium: 0,
          arrears: 0,
        };
      }
      summary.byBroker[m.broker_group].count++;
      summary.byBroker[m.broker_group].premium += m.monthly_premium || 0;
      summary.byBroker[m.broker_group].arrears += m.total_arrears || 0;

      // By status
      if (!summary.byStatus[m.debit_order_status]) {
        summary.byStatus[m.debit_order_status] = {
          count: 0,
          premium: 0,
          arrears: 0,
        };
      }
      summary.byStatus[m.debit_order_status].count++;
      summary.byStatus[m.debit_order_status].premium += m.monthly_premium || 0;
      summary.byStatus[m.debit_order_status].arrears += m.total_arrears || 0;
    });

    console.log('📊 SUMMARY:\n');
    console.log(`Total Members: ${summary.total}`);
    console.log(`Total Premium: R${summary.totalPremium.toFixed(2)}`);
    console.log(`Total Arrears: R${summary.totalArrears.toFixed(2)}`);
    console.log('');

    console.log('By Status:');
    Object.entries(summary.byStatus).forEach(([status, data]) => {
      console.log(`  ${status.padEnd(12)} | ${String(data.count).padStart(4)} members | R${data.premium.toFixed(2).padStart(12)}`);
    });
    console.log('');

    console.log('✅ Summary test completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Query Failed!\n');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testSummaryQuery();
