/**
 * Netcash API Testing Script
 * 
 * Usage:
 * 1. Update the AUTH_TOKEN with your actual JWT token
 * 2. Run: node test-netcash-apis.js
 */

const BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Get this from login

// Helper function to make API calls
async function apiCall(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

// Test functions
async function testTransactions() {
  console.log('\n📊 TESTING TRANSACTIONS...\n');

  // 1. List transactions
  console.log('1. Listing transactions...');
  const list = await apiCall('GET', '/netcash/transactions?limit=5');
  console.log(`   Status: ${list.status}`, list.ok ? '✅' : '❌');
  if (list.ok) {
    console.log(`   Found ${list.data.transactions?.length || 0} transactions`);
  }

  // 2. Get statistics
  console.log('\n2. Getting transaction statistics...');
  const stats = await apiCall('GET', '/netcash/transactions/stats/summary');
  console.log(`   Status: ${stats.status}`, stats.ok ? '✅' : '❌');
  if (stats.ok) {
    console.log(`   Total: ${stats.data.total || 0}`);
    console.log(`   Successful: ${stats.data.successful || 0}`);
    console.log(`   Failed: ${stats.data.failed || 0}`);
  }
}

async function testFailedPayments() {
  console.log('\n⚠️  TESTING FAILED PAYMENTS...\n');

  // 1. List failed payments
  console.log('1. Listing failed payments...');
  const list = await apiCall('GET', '/netcash/failed-payments?limit=5');
  console.log(`   Status: ${list.status}`, list.ok ? '✅' : '❌');
  if (list.ok) {
    console.log(`   Found ${list.data.transactions?.length || 0} failed payments`);
  }

  // 2. Get statistics
  console.log('\n2. Getting failed payment statistics...');
  const stats = await apiCall('GET', '/netcash/failed-payments/stats/summary');
  console.log(`   Status: ${stats.status}`, stats.ok ? '✅' : '❌');
  if (stats.ok) {
    console.log(`   Total Failed: ${stats.data.total || 0}`);
    console.log(`   Can Retry: ${stats.data.canRetry || 0}`);
    console.log(`   Needs Escalation: ${stats.data.needsEscalation || 0}`);
  }

  // 3. Get members with repeated failures
  console.log('\n3. Getting members with repeated failures...');
  const repeated = await apiCall('GET', '/netcash/failed-payments/repeated-failures?minFailures=2');
  console.log(`   Status: ${repeated.status}`, repeated.ok ? '✅' : '❌');
  if (repeated.ok) {
    console.log(`   Found ${repeated.data.length || 0} members with repeated failures`);
  }
}

async function testRefunds() {
  console.log('\n💸 TESTING REFUNDS...\n');

  // 1. List refunds
  console.log('1. Listing refunds...');
  const list = await apiCall('GET', '/netcash/refunds?limit=5');
  console.log(`   Status: ${list.status}`, list.ok ? '✅' : '❌');
  if (list.ok) {
    console.log(`   Found ${list.data.length || 0} refunds`);
  }

  // 2. Get statistics
  console.log('\n2. Getting refund statistics...');
  const stats = await apiCall('GET', '/netcash/refunds/stats/summary');
  console.log(`   Status: ${stats.status}`, stats.ok ? '✅' : '❌');
  if (stats.ok) {
    console.log(`   Total: ${stats.data.total || 0}`);
    console.log(`   Pending: ${stats.data.byStatus?.pending || 0}`);
    console.log(`   Completed: ${stats.data.byStatus?.completed || 0}`);
  }
}

async function testReconciliation() {
  console.log('\n🔄 TESTING RECONCILIATION...\n');

  // 1. List reconciliations
  console.log('1. Listing reconciliations...');
  const list = await apiCall('GET', '/netcash/reconciliation?limit=5');
  console.log(`   Status: ${list.status}`, list.ok ? '✅' : '❌');
  if (list.ok) {
    console.log(`   Found ${list.data.reconciliations?.length || 0} reconciliations`);
  }

  // 2. Get statistics
  console.log('\n2. Getting reconciliation statistics...');
  const stats = await apiCall('GET', '/netcash/reconciliation/stats/summary');
  console.log(`   Status: ${stats.status}`, stats.ok ? '✅' : '❌');
  if (stats.ok) {
    console.log(`   Total: ${stats.data.total || 0}`);
    console.log(`   Average Match Rate: ${stats.data.averageMatchRate?.toFixed(1) || 0}%`);
  }

  // 3. List discrepancies
  console.log('\n3. Listing discrepancies...');
  const discrepancies = await apiCall('GET', '/netcash/reconciliation/discrepancies/list?resolved=false&limit=5');
  console.log(`   Status: ${discrepancies.status}`, discrepancies.ok ? '✅' : '❌');
  if (discrepancies.ok) {
    console.log(`   Found ${discrepancies.data.discrepancies?.length || 0} unresolved discrepancies`);
  }
}

async function testWebhooks() {
  console.log('\n📡 TESTING WEBHOOKS...\n');

  // 1. List webhook logs
  console.log('1. Listing webhook logs...');
  const list = await apiCall('GET', '/netcash/webhook/logs?limit=5');
  console.log(`   Status: ${list.status}`, list.ok ? '✅' : '❌');
  if (list.ok) {
    console.log(`   Found ${list.data.logs?.length || 0} webhook logs`);
  }

  // 2. Get statistics
  console.log('\n2. Getting webhook statistics...');
  const stats = await apiCall('GET', '/netcash/webhook/stats/summary');
  console.log(`   Status: ${stats.status}`, stats.ok ? '✅' : '❌');
  if (stats.ok) {
    console.log(`   Total: ${stats.data.total || 0}`);
    console.log(`   Processed: ${stats.data.processed || 0}`);
    console.log(`   Failed: ${stats.data.failed || 0}`);
    console.log(`   Success Rate: ${stats.data.successRate?.toFixed(1) || 0}%`);
  }
}

async function testDebitOrderManagement() {
  console.log('\n📋 TESTING DEBIT ORDER MANAGEMENT...\n');

  // 1. Get summary
  console.log('1. Getting debit order summary...');
  const summary = await apiCall('GET', '/netcash/summary');
  console.log(`   Status: ${summary.status}`, summary.ok ? '✅' : '❌');
  if (summary.ok) {
    console.log(`   Total Members: ${summary.data.total || 0}`);
    console.log(`   Total Premium: R${summary.data.totalPremium?.toFixed(2) || '0.00'}`);
    console.log(`   Total Arrears: R${summary.data.totalArrears?.toFixed(2) || '0.00'}`);
  }

  // 2. List broker groups
  console.log('\n2. Listing broker groups...');
  const groups = await apiCall('GET', '/netcash/groups');
  console.log(`   Status: ${groups.status}`, groups.ok ? '✅' : '❌');
  if (groups.ok) {
    console.log(`   Found ${groups.data.length || 0} broker groups`);
  }

  // 3. List batches
  console.log('\n3. Listing batches...');
  const batches = await apiCall('GET', '/netcash/batches?limit=5');
  console.log(`   Status: ${batches.status}`, batches.ok ? '✅' : '❌');
  if (batches.ok) {
    console.log(`   Found ${batches.data.length || 0} batches`);
  }

  // 4. List members
  console.log('\n4. Listing members...');
  const members = await apiCall('GET', '/netcash/members?limit=5');
  console.log(`   Status: ${members.status}`, members.ok ? '✅' : '❌');
  if (members.ok) {
    console.log(`   Found ${members.data.length || 0} members`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 NETCASH API TESTING SUITE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Auth Token: ${AUTH_TOKEN.substring(0, 20)}...`);
  console.log('═══════════════════════════════════════════════════════');

  if (AUTH_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('\n❌ ERROR: Please update AUTH_TOKEN in the script first!');
    console.log('   1. Login to get your JWT token');
    console.log('   2. Update AUTH_TOKEN variable at the top of this file');
    console.log('   3. Run the script again\n');
    return;
  }

  try {
    await testDebitOrderManagement();
    await testTransactions();
    await testFailedPayments();
    await testRefunds();
    await testReconciliation();
    await testWebhooks();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ ALL TESTS COMPLETED');
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

// Run tests
runAllTests();
