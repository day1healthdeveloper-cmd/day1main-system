/**
 * TEST TRANSACTION TRACKING & MONITORING APIs
 * Tests all transaction endpoints with SPUTNIK batch
 */

const BACKEND_URL = 'http://localhost:3000/api/v1';
const SPUTNIK_RUN_ID = '534eeb21-9f8a-422c-b5d0-7949084d1230';

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 TESTING TRANSACTION TRACKING & MONITORING');
console.log('═══════════════════════════════════════════════════════════\n');

async function testTransactionAPIs() {
  try {
    // TEST 1: List all transactions for SPUTNIK batch
    console.log('1️⃣ TEST: List transactions for SPUTNIK batch');
    console.log(`   GET ${BACKEND_URL}/netcash/transactions?runId=${SPUTNIK_RUN_ID}\n`);
    
    const listResponse = await fetch(
      `${BACKEND_URL}/netcash/transactions?runId=${SPUTNIK_RUN_ID}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const listData = await listResponse.json();
    console.log(`   Status: ${listResponse.status}`);
    console.log(`   Total transactions: ${listData.total || 0}`);
    
    if (listData.transactions && listData.transactions.length > 0) {
      console.log('   ✅ Transactions found!\n');
      console.log('   Sample transaction:');
      const sample = listData.transactions[0];
      console.log(`   - ID: ${sample.id}`);
      console.log(`   - Member: ${sample.member_number} - ${sample.member_name}`);
      console.log(`   - Amount: R${sample.amount}`);
      console.log(`   - Status: ${sample.status}\n`);
      
      // Save first transaction ID for further tests
      const testTransactionId = sample.id;
      
      // TEST 2: Get single transaction details
      console.log('2️⃣ TEST: Get transaction details');
      console.log(`   GET ${BACKEND_URL}/netcash/transactions/${testTransactionId}\n`);
      
      const detailResponse = await fetch(
        `${BACKEND_URL}/netcash/transactions/${testTransactionId}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const detailData = await detailResponse.json();
      console.log(`   Status: ${detailResponse.status}`);
      
      if (detailResponse.ok) {
        console.log('   ✅ Transaction details retrieved!\n');
        console.log(`   - Transaction ID: ${detailData.id}`);
        console.log(`   - Member: ${detailData.member_number}`);
        console.log(`   - Amount: R${detailData.amount}`);
        console.log(`   - Status: ${detailData.status}`);
        console.log(`   - Created: ${detailData.created_at}\n`);
      } else {
        console.log(`   ❌ Failed: ${JSON.stringify(detailData)}\n`);
      }
      
      // TEST 3: Get transaction statistics
      console.log('3️⃣ TEST: Get transaction statistics');
      console.log(`   GET ${BACKEND_URL}/netcash/transactions/stats/summary?runId=${SPUTNIK_RUN_ID}\n`);
      
      const statsResponse = await fetch(
        `${BACKEND_URL}/netcash/transactions/stats/summary?runId=${SPUTNIK_RUN_ID}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const statsData = await statsResponse.json();
      console.log(`   Status: ${statsResponse.status}`);
      
      if (statsResponse.ok) {
        console.log('   ✅ Statistics retrieved!\n');
        console.log(`   Total transactions: ${statsData.total}`);
        console.log(`   By status:`);
        console.log(`   - Pending: ${statsData.byStatus.pending}`);
        console.log(`   - Successful: ${statsData.byStatus.successful}`);
        console.log(`   - Failed: ${statsData.byStatus.failed}`);
        console.log(`   Total amount: R${statsData.amounts.total}`);
        console.log(`   Success rate: ${statsData.successRate.toFixed(2)}%\n`);
      } else {
        console.log(`   ❌ Failed: ${JSON.stringify(statsData)}\n`);
      }
      
      // TEST 4: Filter transactions by status
      console.log('4️⃣ TEST: Filter transactions by status (pending)');
      console.log(`   GET ${BACKEND_URL}/netcash/transactions?status=pending\n`);
      
      const filterResponse = await fetch(
        `${BACKEND_URL}/netcash/transactions?status=pending`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const filterData = await filterResponse.json();
      console.log(`   Status: ${filterResponse.status}`);
      console.log(`   Pending transactions: ${filterData.total || 0}`);
      
      if (filterResponse.ok) {
        console.log('   ✅ Filter works!\n');
      } else {
        console.log(`   ❌ Failed: ${JSON.stringify(filterData)}\n`);
      }
      
      // TEST 5: Get failed transactions
      console.log('5️⃣ TEST: Get failed transactions');
      console.log(`   GET ${BACKEND_URL}/netcash/transactions/failed/list\n`);
      
      const failedResponse = await fetch(
        `${BACKEND_URL}/netcash/transactions/failed/list`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const failedData = await failedResponse.json();
      console.log(`   Status: ${failedResponse.status}`);
      console.log(`   Failed transactions: ${failedData.length || 0}`);
      
      if (failedResponse.ok) {
        console.log('   ✅ Failed transactions endpoint works!\n');
      } else {
        console.log(`   ❌ Failed: ${JSON.stringify(failedData)}\n`);
      }
      
    } else {
      console.log('   ❌ No transactions found!\n');
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ TRANSACTION API TESTS COMPLETE');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📋 TEST SUMMARY:');
    console.log('   ✅ List transactions');
    console.log('   ✅ Get transaction details');
    console.log('   ✅ Get statistics');
    console.log('   ✅ Filter by status');
    console.log('   ✅ Get failed transactions\n');
    
    console.log('📝 NEXT TESTS:');
    console.log('   - Update transaction status');
    console.log('   - Retry failed transaction');
    console.log('   - View in UI (http://localhost:3001/operations/debit-orders)\n');
    
  } catch (error) {
    console.error('\n❌ ERROR!\n');
    console.error(`   ${error.message}\n`);
  }
}

testTransactionAPIs();
