/**
 * Test with actual JWT token
 * You need to copy your token from browser localStorage
 */

const BACKEND_URL = 'http://localhost:3000/api/v1';

// PASTE YOUR TOKEN HERE from browser console: localStorage.getItem('accessToken')
const TOKEN = 'YOUR_TOKEN_HERE';

async function testWithToken() {
  console.log('🔍 Testing with JWT token...\n');
  console.log('Token (first 50 chars):', TOKEN.substring(0, 50));
  console.log('');

  try {
    const response = await fetch(`${BACKEND_URL}/netcash/groups`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response:', text);

    if (response.ok) {
      const data = JSON.parse(text);
      console.log('\n✅ Success! Received', Array.isArray(data) ? data.length : 0, 'groups');
      if (Array.isArray(data) && data.length > 0) {
        console.log('\nFirst group:');
        console.log(JSON.stringify(data[0], null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (TOKEN === 'YOUR_TOKEN_HERE') {
  console.log('❌ Please edit this file and paste your JWT token from browser localStorage');
  console.log('\nIn browser console, run: localStorage.getItem("accessToken")');
  console.log('Then paste the token value into this file');
} else {
  testWithToken();
}
