/**
 * Check SPUTNIK Batch Status
 * Run: node supabase/check-sputnik-batch.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function checkSputnikBatch() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 CHECKING SPUTNIK BATCH STATUS');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // 1. Find SPUTNIK batch
    console.log('1️⃣  Finding SPUTNIK batch...');
    const runsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/debit_order_runs?select=*&batch_name=like.SPUTNIK*&order=created_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const runs = await runsResponse.json();
    
    if (!runs || runs.length === 0) {
      console.log('   ❌ No SPUTNIK batch found!');
      console.log('   Run: node supabase/send-sputnik-batch.js to create one\n');
      return;
    }

    console.log(`   ✅ Found ${runs.length} SPUTNIK batch(es)\n`);

    // 2. Display each SPUTNIK batch
    for (const run of runs) {
      console.log('📋 Batch Details:');
      console.log('─────────────────────────────────────────────────────────');
      console.log(`Run ID: ${run.id}`);
      console.log(`Batch Name: ${run.batch_name}`);
      console.log(`Run Date: ${new Date(run.run_date).toLocaleString()}`);
      console.log(`Status: ${run.status}`);
      console.log(`Batch Type: ${run.batch_type}`);
      console.log(`Total Members: ${run.total_members}`);
      console.log(`Total Amount: R${run.total_amount?.toFixed(2) || '0.00'}`);
      
      if (run.netcash_batch_reference) {
        console.log(`Netcash Batch Ref: ${run.netcash_batch_reference}`);
      } else {
        console.log('Netcash Batch Ref: ⚠️  Not submitted yet');
      }
      
      if (run.netcash_status) {
        console.log(`Netcash Status: ${run.netcash_status}`);
      }
      
      if (run.submitted_at) {
        console.log(`Submitted At: ${new Date(run.submitted_at).toLocaleString()}`);
      }
      
      if (run.error_message) {
        console.log(`Error: ${run.error_message}`);
      }
      
      console.log(`Created: ${new Date(run.created_at).toLocaleString()}`);
      console.log('');

      // 3. Get transactions for this run
      console.log('💳 Transactions:');
      console.log('─────────────────────────────────────────────────────────');
      
      const txResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/debit_order_transactions?select=*&run_id=eq.${run.id}&order=created_at.asc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      const transactions = await txResponse.json();
      console.log(`Total Transactions: ${transactions.length}`);
      
      // Group by status
      const byStatus = {};
      transactions.forEach(tx => {
        if (!byStatus[tx.status]) {
          byStatus[tx.status] = [];
        }
        byStatus[tx.status].push(tx);
      });

      console.log('\nBy Status:');
      Object.keys(byStatus).forEach(status => {
        const txs = byStatus[status];
        const totalAmount = txs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        console.log(`  ${status}: ${txs.length} (R${totalAmount.toFixed(2)})`);
      });

      // Show individual transactions
      console.log('\nTransaction Details:');
      transactions.forEach((tx, index) => {
        console.log(`\n${index + 1}. ${tx.member_number} - ${tx.member_name}`);
        console.log(`   Transaction ID: ${tx.id.substring(0, 8)}...`);
        console.log(`   Amount: R${tx.amount?.toFixed(2) || '0.00'}`);
        console.log(`   Status: ${tx.status}`);
        
        if (tx.netcash_reference) {
          console.log(`   Netcash Ref: ${tx.netcash_reference}`);
        }
        
        if (tx.error_message) {
          console.log(`   Error: ${tx.error_message}`);
        }
        
        if (tx.rejection_reason) {
          console.log(`   Rejection: ${tx.rejection_reason}`);
        }
        
        if (tx.processed_at) {
          console.log(`   Processed: ${new Date(tx.processed_at).toLocaleString()}`);
        }
      });

      console.log('\n');
    }

    // 4. Testing checklist
    const latestRun = runs[0];
    const hasNetcashRef = !!latestRun.netcash_batch_reference;
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ SPUTNIK BATCH STATUS CHECK COMPLETE');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📋 TESTING CHECKLIST:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`${hasNetcashRef ? '✅' : '⬜'} 1. Batch submitted to Netcash`);
    console.log(`⬜ 2. View transactions in UI`);
    console.log(`⬜ 3. Check transaction details`);
    console.log(`⬜ 4. Test transaction status updates`);
    console.log(`⬜ 5. Test failed payment retry`);
    console.log(`⬜ 6. Test refund creation`);
    console.log(`⬜ 7. Test reconciliation`);
    console.log(`⬜ 8. Test webhook receiving\n`);

    if (!hasNetcashRef) {
      console.log('⚠️  NEXT STEP: Submit batch to Netcash');
      console.log('   1. Go to: http://localhost:3001/operations/debit-orders');
      console.log('   2. Find SPUTNIK batch');
      console.log('   3. Click "Submit to Netcash"');
      console.log('   4. Authorize in Netcash portal\n');
    } else {
      console.log('✅ Batch submitted! Ready for testing.');
      console.log('   Run this script again to check for updates\n');
    }

    console.log('📊 Quick Stats:');
    console.log(`   Run ID: ${latestRun.id}`);
    console.log(`   Batch Name: ${latestRun.batch_name}`);
    console.log(`   Status: ${latestRun.status}`);
    console.log(`   Members: ${latestRun.total_members}`);
    console.log(`   Amount: R${latestRun.total_amount?.toFixed(2)}\n`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  }
}

checkSputnikBatch();
