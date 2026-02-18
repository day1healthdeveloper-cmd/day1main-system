/**
 * Test failed payments API endpoints
 */

const BACKEND_URL = 'http://localhost:3000/api/v1';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxOTlkMjFjMi03MGYzLTRiNmUtOWQ5ZS1hYTAyYTkyMmI0MTEiLCJlbWFpbCI6Im9wZXJhdGlvbnNAZGF5MW1haW4uY29tIiwiaWF0IjoxNzcxMTMxODQ1LCJleHAiOjE3NzExNjA2NDV9.yFGpHvCGb2GtDBZ9LqgobN5wJxHVgyny-0Bi0gbUW1k';

async function testFailedPayments() {
  console.log('🧪 Testing Failed Payments API...\n');
  
  try {
    // Test 1: Get failed payments list
    console.log('1️⃣ Testing GET /netcash/failed-payments');
    const listResponse = await fetch(`${BACKEND_URL}/netcash/failed-payments?limit=10`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${listResponse.status} ${listResponse.statusText}`);
    
    if (listResponse.ok) {
      const data = await listResponse.json();
      console.log(`   ✅ Success! Found ${data.transactions?.length || 0} failed payments`);
      console.log(`   Total: ${data.total}\n`);
    } else {
      const error = await listResponse.text();
      console.log(`   ❌ Failed: ${error}\n`);
    }
    
    // Test 2: Get failed payments statistics
    console.log('2️⃣ Testing GET /netcash/failed-payments/stats/summary');
    const statsResponse = await fetch(`${BACKEND_URL}/netcash/failed-payments/stats/summary`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${statsResponse.status} ${statsResponse.statusText}`);
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log(`   ✅ Success!`);
      console.log(`   Total Failed: ${stats.total}`);
      console.log(`   Total Amount: R${stats.totalAmount?.toFixed(2)}`);
      console.log(`   Can Retry: ${stats.canRetry}`);
      console.log(`   Needs Escalation: ${stats.needsEscalation}\n`);
    } else {
      const error = await statsResponse.text();
      console.log(`   ❌ Failed: ${error}\n`);
    }
    
    console.log('✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFailedPayments();
