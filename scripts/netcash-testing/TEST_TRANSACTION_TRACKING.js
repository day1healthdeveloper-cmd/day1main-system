/**
 * TEST TRANSACTION TRACKING & MONITORING
 * Tests from NETCASH_TESTING_CHECKLIST.md section 1
 */

const BACKEND_URL = 'http://localhost:3000/api/v1';
const SPUTNIK_RUN_ID = '3699f68d-7085-4106-a4b5-be14479c4500';
const SPUTNIK_TRANSACTION_ID = 'a214f441-8c3e-4e5e-8e5e-8e5e8e5e8e5e'; // Will get actual ID

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 TRANSACTION TRACKING & MONITORING TESTS');
console.log('═══════════════════════════════════════════════════════════\n');

let testTransactionId = null;
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (details) console.log(`   ${details}`);
  console.log('');
  
  testResults.tests.push({ name, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

async function runTests() {
  try {
    // TEST 1.1.1: List all transactions (no filters)
    console.log('📋 TEST 1.1.1: List all transactions (no filters)');
    console.log(`   GET ${BACKEND_URL}/netcash/transactions\n`);
    
    const listAllResponse = await fetch(`${BACKEND_URL}/netcash/transactions`);
    const listAllData = await listAllResponse.json();
    
    if (listAllResponse.status === 401) {
      console.log('⚠️  Authentication required. Tests need JWT token.');
      console.log('   View transactions in UI: http://localhost:3001/operations/debit-orders\n');
      return;
    }
    
    logTest(
      'List all transactions',
      listAllResponse.ok && listAllData.transactions,
      `Status: ${listAllResponse.status}, Total: ${listAllData.total || 0}`
    );
    
    if (listAllData.transactions && listAllData.transactions.length > 0) {
      testTransactionId = listAllData.transactions[0].id;
      console.log(`   📌 Using transaction ID: ${testTransactionId}\n`);
    }
    
    // TEST 1.1.2: List transactions with run ID filter
    console.log('📋 TEST 1.1.2: List transactions with run ID filter');
    console.log(`   GET ${BACKEND_URL}/netcash/transactions?runId=${SPUTNIK_RUN_ID}\n`);
    
    const listFilteredResponse = await fetch(
      `${BACKEND_URL}/netcash/transactions?runId=${SPUTNIK_RUN_ID}`
    );
    const listFilteredData = await listFilteredResponse.json();
    
    logTest(
      'Filter transactions by run ID',
      listFilteredResponse.ok && listFilteredData.transactions,
      `Status: ${listFilteredResponse.status}, Total: ${listFilteredData.total || 0}`
    );
    
    // TEST 1.1.3: Filter by status (pending)
    console.log('📋 TEST 1.1.3: Filter transactions by status');
    console.log(`   GET ${BACKEND_URL}/netcash/transactions?status=pending\n`);
    
    const listPendingResponse = await fetch(
      `${BACKEND_URL}/netcash/transactions?status=pending`
    );
    const listPendingData = await listPendingResponse.json();
    
    logTest(
      'Filter transactions by status (pending)',
      listPendingResponse.ok && listPendingData.transactions,
      `Status: ${listPendingResponse.status}, Pending: ${listPendingData.total || 0}`
    );
    
    // TEST 1.1.4: Get single transaction details
    if (testTransactionId) {
      console.log('📋 TEST 1.1.4: Get single transaction details');
      console.log(`   GET ${BACKEND_URL}/netcash/transactions/${testTransactionId}\n`);
      
      const detailResponse = await fetch(
        `${BACKEND_URL}/netcash/transactions/${testTransactionId}`
      );
      const detailData = await detailResponse.json();
      
      logTest(
        'Get transaction details',
        detailResponse.ok && detailData.id,
        `Status: ${detailResponse.status}, ID: ${detailData.id || 'N/A'}`
      );
    }
    
    // TEST 1.1.5: Get transaction statistics
    console.log('📋 TEST 1.1.5: Get transaction statistics');
    console.log(`   GET ${BACKEND_URL}/netcash/transactions/stats/summary\n`);
    
    const statsResponse = await fetch(
      `${BACKEND_URL}/netcash/transactions/stats/summary`
    );
    const statsData = await statsResponse.json();
    
    logTest(
      'Get transaction statistics',
      statsResponse.ok && statsData.total !== undefined,
      `Status: ${statsResponse.status}, Total: ${statsData.total || 0}, Success Rate: ${statsData.successRate || 0}%`
    );
    
    // TEST 1.1.6: Get statistics with run ID filter
    console.log('📋 TEST 1.1.6: Get statistics with run ID filter');
    console.log(`   GET ${BACKEND_URL}/netcash/transactions/stats/summary?runId=${SPUTNIK_RUN_ID}\n`);
    
    const statsFilteredResponse = await fetch(
      `${BACKEND_URL}/netcash/transactions/stats/summary?runId=${SPUTNIK_RUN_ID}`
    );
    const statsFilteredData = await statsFilteredResponse.json();
    
    logTest(
      'Get statistics for specific run',
      statsFilteredResponse.ok && statsFilteredData.total !== undefined,
      `Status: ${statsFilteredResponse.status}, Total: ${statsFilteredData.total || 0}`
    );
    
    // TEST 1.1.7: Test pagination
    console.log('📋 TEST 1.1.7: Test pagination');
    console.log(`   GET ${BACKEND_URL}/netcash/transactions?limit=5&offset=0\n`);
    
    const paginationResponse = await fetch(
      `${BACKEND_URL}/netcash/transactions?limit=5&offset=0`
    );
    const paginationData = await paginationResponse.json();
    
    logTest(
      'Pagination (limit/offset)',
      paginationResponse.ok && paginationData.limit === 5,
      `Status: ${paginationResponse.status}, Limit: ${paginationData.limit}, Offset: ${paginationData.offset}`
    );
    
    // TEST 1.1.8: Get failed transactions
    console.log('📋 TEST 1.1.8: Get failed transactions');
    console.log(`   GET ${BACKEND_URL}/netcash/transactions/failed/list\n`);
    
    const failedResponse = await fetch(
      `${BACKEND_URL}/netcash/transactions/failed/list`
    );
    const failedData = await failedResponse.json();
    
    logTest(
      'Get failed transactions',
      failedResponse.ok && Array.isArray(failedData),
      `Status: ${failedResponse.status}, Failed: ${failedData.length || 0}`
    );
    
    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📋 Total: ${testResults.tests.length}\n`);
    
    if (testResults.failed === 0) {
      console.log('🎉 All tests passed!\n');
    } else {
      console.log('⚠️  Some tests failed. Review details above.\n');
    }
    
    console.log('📝 NEXT STEPS:');
    console.log('   1. View transactions in UI: http://localhost:3001/operations/debit-orders');
    console.log('   2. Test transaction status updates (manual in UI)');
    console.log('   3. Test transaction retry functionality');
    console.log('   4. Continue with Failed Payment Management tests\n');
    
  } catch (error) {
    console.error('\n❌ ERROR!\n');
    console.error(`   ${error.message}\n`);
    console.error(error.stack);
  }
}

runTests();
