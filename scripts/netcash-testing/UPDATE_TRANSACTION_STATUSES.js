/**
 * Update transaction statuses for testing
 * Creates a mix of successful, failed, and pending transactions
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

console.log('═══════════════════════════════════════════════════════════');
console.log('🔄 UPDATING TRANSACTION STATUSES FOR TESTING');
console.log('═══════════════════════════════════════════════════════════\n');

async function updateStatuses() {
  try {
    // 1. Get all transactions
    console.log('1️⃣ Fetching all transactions...');
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/debit_order_transactions?select=id,member_number,amount,status&order=created_at.desc&limit=20`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const transactions = await response.json();
    console.log(`   ✅ Found ${transactions.length} transactions\n`);
    
    if (transactions.length === 0) {
      console.log('   ⚠️  No transactions found!\n');
      return;
    }
    
    // 2. Update statuses to create test scenarios
    console.log('2️⃣ Updating transaction statuses...\n');
    
    // Make 30% successful
    const successfulCount = Math.ceil(transactions.length * 0.3);
    for (let i = 0; i < successfulCount; i++) {
      const txn = transactions[i];
      await fetch(
        `${SUPABASE_URL}/rest/v1/debit_order_transactions?id=eq.${txn.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            status: 'successful',
            netcash_status: 'APPROVED',
            settled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      );
      console.log(`   ✅ ${txn.member_number} → successful (R${txn.amount})`);
    }
    
    // Make 40% failed with different failure reasons
    const failedCount = Math.ceil(transactions.length * 0.4);
    const failureReasons = [
      'Insufficient funds',
      'Account closed',
      'Invalid account number',
      'Bank declined',
      'Account suspended'
    ];
    
    for (let i = successfulCount; i < successfulCount + failedCount; i++) {
      const txn = transactions[i];
      const reason = failureReasons[i % failureReasons.length];
      const retryCount = Math.floor(Math.random() * 3); // 0-2 retries
      
      await fetch(
        `${SUPABASE_URL}/rest/v1/debit_order_transactions?id=eq.${txn.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            status: 'failed',
            netcash_status: 'DECLINED',
            failure_reason: reason,
            retry_count: retryCount,
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      );
      console.log(`   ❌ ${txn.member_number} → failed (${reason}, ${retryCount} retries)`);
    }
    
    // Leave remaining as pending
    const remainingCount = transactions.length - successfulCount - failedCount;
    console.log(`   ⏳ ${remainingCount} transactions remain pending\n`);
    
    // 3. Show summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ TRANSACTION STATUSES UPDATED');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📊 SUMMARY:');
    console.log(`   Total Transactions: ${transactions.length}`);
    console.log(`   Successful: ${successfulCount} (30%)`);
    console.log(`   Failed: ${failedCount} (40%)`);
    console.log(`   Pending: ${remainingCount} (30%)\n`);
    
    console.log('📝 NEXT STEPS:');
    console.log('   1. Refresh the Transactions tab in the UI');
    console.log('   2. Test filtering by status (successful, failed, pending)');
    console.log('   3. View transaction details');
    console.log('   4. Test Failed Payments tab');
    console.log('   5. Test retry functionality on failed transactions\n');
    
  } catch (error) {
    console.error('\n❌ ERROR!\n');
    console.error(`   ${error.message}\n`);
  }
}

updateStatuses();
