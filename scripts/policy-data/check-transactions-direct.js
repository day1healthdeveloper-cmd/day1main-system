/**
 * Check Transactions Directly from Supabase
 * Run: node supabase/check-transactions-direct.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function checkTransactions() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 CHECKING TRANSACTION DATA');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // 1. Count total transactions
    console.log('1️⃣  Counting total transactions...');
    const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/debit_order_transactions?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });

    const countHeader = countResponse.headers.get('content-range');
    const totalCount = countHeader ? parseInt(countHeader.split('/')[1]) : 0;
    console.log(`   ✅ Total Transactions: ${totalCount}\n`);

    if (totalCount === 0) {
      console.log('⚠️  No transactions found in database!');
      console.log('   You need to run a debit order batch first.\n');
      console.log('   Steps:');
      console.log('   1. Go to http://localhost:3001/operations/debit-orders');
      console.log('   2. Click "Run Debit Orders" button');
      console.log('   3. Submit a batch to Netcash\n');
      return;
    }

    // 2. Get transactions with details
    console.log('2️⃣  Fetching transaction details...');
    const txResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/debit_order_transactions?select=id,member_id,run_id,amount,status,error_message,rejection_reason,netcash_reference,created_at,processed_at&order=created_at.desc&limit=20`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const transactions = await txResponse.json();
    console.log(`   ✅ Fetched ${transactions.length} recent transactions\n`);

    // 3. Group by status
    console.log('3️⃣  Grouping by status...');
    const byStatus = {};
    transactions.forEach(tx => {
      if (!byStatus[tx.status]) {
        byStatus[tx.status] = [];
      }
      byStatus[tx.status].push(tx);
    });

    console.log('   📈 Transactions by Status:');
    Object.keys(byStatus).forEach(status => {
      console.log(`      ${status}: ${byStatus[status].length}`);
    });
    console.log('');

    // 4. Show recent transactions
    console.log('4️⃣  Recent Transactions (Last 10):');
    console.log('   ─────────────────────────────────────────────────────────');
    
    transactions.slice(0, 10).forEach((tx, index) => {
      console.log(`\n   ${index + 1}. Transaction ID: ${tx.id.substring(0, 8)}...`);
      console.log(`      Amount: R${tx.amount?.toFixed(2) || '0.00'}`);
      console.log(`      Status: ${tx.status}`);
      if (tx.netcash_reference) {
        console.log(`      Netcash Ref: ${tx.netcash_reference}`);
      }
      if (tx.error_message) {
        console.log(`      Error: ${tx.error_message.substring(0, 100)}...`);
      }
      if (tx.rejection_reason) {
        console.log(`      Rejection: ${tx.rejection_reason}`);
      }
      console.log(`      Created: ${new Date(tx.created_at).toLocaleString()}`);
      if (tx.processed_at) {
        console.log(`      Processed: ${new Date(tx.processed_at).toLocaleString()}`);
      }
    });

    // 5. Get failed transactions
    console.log('\n\n5️⃣  Checking for failed transactions...');
    const failedResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/debit_order_transactions?select=id,amount,error_message,rejection_reason,member_id&status=eq.failed&limit=10`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const failedTx = await failedResponse.json();

    if (failedTx && failedTx.length > 0) {
      console.log(`   ⚠️  Found ${failedTx.length} failed transactions:`);
      console.log('   ─────────────────────────────────────────────────────────');
      failedTx.forEach((tx, index) => {
        console.log(`\n   ${index + 1}. ID: ${tx.id.substring(0, 8)}...`);
        console.log(`      Amount: R${tx.amount?.toFixed(2)}`);
        console.log(`      Error: ${tx.error_message || 'Unknown'}`);
        if (tx.rejection_reason) {
          console.log(`      Rejection: ${tx.rejection_reason}`);
        }
      });
    } else {
      console.log('   ✅ No failed transactions found');
    }

    // 6. Calculate statistics
    console.log('\n\n6️⃣  Calculating statistics...');
    const statistics = {
      total: transactions.length,
      totalAmount: 0,
      byStatus: {},
    };

    transactions.forEach(tx => {
      statistics.totalAmount += tx.amount || 0;
      if (!statistics.byStatus[tx.status]) {
        statistics.byStatus[tx.status] = { count: 0, amount: 0 };
      }
      statistics.byStatus[tx.status].count++;
      statistics.byStatus[tx.status].amount += tx.amount || 0;
    });

    console.log('   📊 Overall Statistics:');
    console.log('   ─────────────────────────────────────────────────────────');
    console.log(`   Total Transactions: ${statistics.total}`);
    console.log(`   Total Amount: R${statistics.totalAmount.toFixed(2)}`);
    console.log('\n   By Status:');
    Object.keys(statistics.byStatus).forEach(status => {
      const stat = statistics.byStatus[status];
      console.log(`     ${status}:`);
      console.log(`       Count: ${stat.count}`);
      console.log(`       Amount: R${stat.amount.toFixed(2)}`);
    });

    // 7. Check debit order runs
    console.log('\n\n7️⃣  Checking debit order runs...');
    const runsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/debit_order_runs?select=id,batch_name,run_date,status,total_members,total_amount,netcash_batch_reference&order=run_date.desc&limit=5`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const runs = await runsResponse.json();
    if (runs && runs.length > 0) {
      console.log(`   ✅ Found ${runs.length} recent runs:`);
      console.log('   ─────────────────────────────────────────────────────────');
      runs.forEach((run, index) => {
        console.log(`\n   ${index + 1}. ${run.batch_name}`);
        console.log(`      Run Date: ${new Date(run.run_date).toLocaleDateString()}`);
        console.log(`      Status: ${run.status}`);
        console.log(`      Members: ${run.total_members || 0}`);
        console.log(`      Amount: R${run.total_amount?.toFixed(2) || '0.00'}`);
        if (run.netcash_batch_reference) {
          console.log(`      Netcash Ref: ${run.netcash_batch_reference}`);
        }
      });
    } else {
      console.log('   ⚠️  No debit order runs found');
    }

    // 8. Test data availability
    console.log('\n\n8️⃣  Test Data Availability:');
    console.log('   ─────────────────────────────────────────────────────────');
    
    const hasTransactions = transactions.length > 0;
    const hasFailedTransactions = failedTx && failedTx.length > 0;
    const hasSuccessfulTransactions = byStatus['successful']?.length > 0;
    const hasPendingTransactions = byStatus['pending']?.length > 0;
    
    console.log(`   ${hasTransactions ? '✅' : '❌'} Has Transactions: ${hasTransactions ? 'YES' : 'NO'}`);
    console.log(`   ${hasFailedTransactions ? '✅' : '⚠️ '} Has Failed Transactions: ${hasFailedTransactions ? 'YES' : 'NO'}`);
    console.log(`   ${hasSuccessfulTransactions ? '✅' : '⚠️ '} Has Successful Transactions: ${hasSuccessfulTransactions ? 'YES' : 'NO'}`);
    console.log(`   ${hasPendingTransactions ? '✅' : '⚠️ '} Has Pending Transactions: ${hasPendingTransactions ? 'YES' : 'NO'}`);

    if (hasTransactions) {
      console.log('\n   📝 Sample Transaction IDs for Testing:');
      if (transactions[0]) {
        console.log(`      Any Transaction: ${transactions[0].id}`);
      }
      if (failedTx && failedTx[0]) {
        console.log(`      Failed Transaction: ${failedTx[0].id}`);
      }
      if (byStatus['successful'] && byStatus['successful'][0]) {
        console.log(`      Successful Transaction: ${byStatus['successful'][0].id}`);
      }
      if (byStatus['pending'] && byStatus['pending'][0]) {
        console.log(`      Pending Transaction: ${byStatus['pending'][0].id}`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ TRANSACTION CHECK COMPLETE');
    console.log('═══════════════════════════════════════════════════════\n');

    // 9. Next steps
    console.log('📋 NEXT STEPS FOR TESTING:');
    console.log('─────────────────────────────────────────────────────────');
    console.log('1. Test Transaction Viewing:');
    console.log('   - Open: http://localhost:3001/operations/debit-orders');
    console.log('   - Click on "Transactions" tab');
    console.log('   - Verify transactions are displayed\n');
    
    console.log('2. Test Transaction Details:');
    console.log('   - Click "View" on any transaction');
    console.log('   - Verify all details are shown\n');
    
    if (hasFailedTransactions) {
      console.log('3. Test Failed Payment Retry:');
      console.log('   - Go to "Failed" tab');
      console.log('   - Click "Retry" on a failed payment');
      console.log('   - Verify retry functionality\n');
    }
    
    console.log('4. Test Statistics:');
    console.log('   - Verify statistics cards show correct numbers');
    console.log('   - Check totals match database counts\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:', error);
  }
}

checkTransactions();
