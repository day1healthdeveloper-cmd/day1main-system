/**
 * Check Debit Order Runs
 * Run: node supabase/check-debit-runs.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function checkDebitRuns() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📋 CHECKING DEBIT ORDER RUNS');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Get all debit order runs
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/debit_order_runs?select=*&order=created_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const runs = await response.json();
    
    console.log(`✅ Found ${runs.length} debit order runs\n`);

    if (runs.length === 0) {
      console.log('⚠️  No debit order runs found!');
      console.log('   This means no batch has been submitted yet.\n');
      return;
    }

    // Display each run
    runs.forEach((run, index) => {
      console.log(`${index + 1}. Run ID: ${run.id}`);
      console.log(`   Batch Name: ${run.batch_name || 'N/A'}`);
      console.log(`   Run Date: ${run.run_date ? new Date(run.run_date).toLocaleString() : 'N/A'}`);
      console.log(`   Status: ${run.status || 'N/A'}`);
      console.log(`   Batch Type: ${run.batch_type || 'N/A'}`);
      console.log(`   Total Members: ${run.total_members || 0}`);
      console.log(`   Total Amount: R${run.total_amount?.toFixed(2) || '0.00'}`);
      console.log(`   Netcash Batch Ref: ${run.netcash_batch_reference || 'Not submitted'}`);
      console.log(`   Netcash Status: ${run.netcash_status || 'N/A'}`);
      if (run.submitted_at) {
        console.log(`   Submitted At: ${new Date(run.submitted_at).toLocaleString()}`);
      }
      if (run.error_message) {
        console.log(`   Error: ${run.error_message}`);
      }
      console.log(`   Created: ${new Date(run.created_at).toLocaleString()}`);
      console.log('');
    });

    // Check for transactions in each run
    console.log('📊 Checking transactions for each run...\n');
    
    for (const run of runs) {
      const txResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/debit_order_transactions?select=count&run_id=eq.${run.id}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'count=exact'
          }
        }
      );

      const countHeader = txResponse.headers.get('content-range');
      const txCount = countHeader ? parseInt(countHeader.split('/')[1]) : 0;
      
      console.log(`   Run: ${run.batch_name}`);
      console.log(`   Transactions: ${txCount}`);
      console.log(`   Expected: ${run.total_members || 0}`);
      console.log(`   Match: ${txCount === run.total_members ? '✅' : '⚠️'}`);
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ CHECK COMPLETE');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  }
}

checkDebitRuns();
