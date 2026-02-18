/**
 * Update transaction statuses via backend API
 * Requires authentication token from localStorage
 */

const BACKEND_URL = 'http://localhost:3000/api/v1';

// You need to get this from your browser's localStorage
// Open DevTools → Console → Run: localStorage.getItem('accessToken')
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxOTlkMjFjMi03MGYzLTRiNmUtOWQ5ZS1hYTAyYTkyMmI0MTEiLCJlbWFpbCI6Im9wZXJhdGlvbnNAZGF5MW1haW4uY29tIiwiaWF0IjoxNzcxMTMxODQ1LCJleHAiOjE3NzExNjA2NDV9.yFGpHvCGb2GtDBZ9LqgobN5wJxHVgyny-0Bi0gbUW1k';

console.log('🔄 Updating transaction statuses via backend API...\n');
console.log('⚠️  IMPORTANT: Update ACCESS_TOKEN in this file first!\n');
console.log('   1. Open browser DevTools (F12)');
console.log('   2. Go to Console tab');
console.log('   3. Run: localStorage.getItem("accessToken")');
console.log('   4. Copy the token and paste it in this file\n');

if (ACCESS_TOKEN === 'YOUR_TOKEN_HERE') {
  console.log('❌ Please update ACCESS_TOKEN first!\n');
  process.exit(1);
}

async function updateStatuses() {
  try {
    // Get all transactions
    console.log('Fetching transactions...');
    const listResponse = await fetch(`${BACKEND_URL}/netcash/transactions`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!listResponse.ok) {
      console.error(`❌ Failed to fetch transactions: ${listResponse.status} ${listResponse.statusText}`);
      const errorText = await listResponse.text();
      console.error('Response:', errorText);
      return;
    }
    
    const data = await listResponse.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    const transactions = data.transactions || [];
    
    if (transactions.length === 0) {
      console.log('❌ No transactions found!\n');
      return;
    }
    
    console.log(`Found ${transactions.length} transactions\n`);
    
    // Update first 6 to successful
    for (let i = 0; i < 6 && i < transactions.length; i++) {
      const txn = transactions[i];
      await fetch(`${BACKEND_URL}/netcash/transactions/${txn.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'successful',
          netcashStatus: 'APPROVED'
        })
      });
      console.log(`✅ ${txn.member_number} → successful`);
    }
    
    // Update next 8 to failed
    const reasons = ['Insufficient funds', 'Account closed', 'Invalid account', 'Bank declined'];
    for (let i = 6; i < 14 && i < transactions.length; i++) {
      const txn = transactions[i];
      await fetch(`${BACKEND_URL}/netcash/transactions/${txn.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'failed',
          netcashStatus: 'DECLINED',
          failureReason: reasons[(i-6) % reasons.length]
        })
      });
      console.log(`❌ ${txn.member_number} → failed (${reasons[(i-6) % reasons.length]})`);
    }
    
    console.log('\n✅ Done! Refresh the UI to see changes.');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateStatuses();
