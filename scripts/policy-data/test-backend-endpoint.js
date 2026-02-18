/**
 * Test Backend Endpoint Directly
 * Run: node test-backend-endpoint.js
 */

const BACKEND_URL = 'http://localhost:3000/api/v1';

// You need to get a valid JWT token from localStorage
// For now, let's test without auth to see what error we get
async function testBackendEndpoint() {
  console.log('🔍 Testing Backend Endpoint...\n');

  try {
    console.log('Testing: GET /api/v1/netcash/groups');
    console.log('URL:', `${BACKEND_URL}/netcash/groups\n`);

    const response = await fetch(`${BACKEND_URL}/netcash/groups`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('\nResponse body:');
    console.log(text);

    if (response.ok) {
      const data = JSON.parse(text);
      console.log('\n✅ Success! Received', Array.isArray(data) ? data.length : 0, 'groups');
    } else {
      console.log('\n❌ Request failed with status:', response.status);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBackendEndpoint();
