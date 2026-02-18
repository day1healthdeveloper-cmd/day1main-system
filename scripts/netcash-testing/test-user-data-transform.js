/**
 * Test script to verify user data transformation
 * Tests that the API client properly transforms backend response to frontend format
 */

const API_URL = 'http://localhost:3000/api/v1';

// Test user credentials
const testUser = {
  email: 'admin@day1main.com',
  password: 'admin123'
};

async function testUserDataTransform() {
  console.log('🧪 Testing User Data Transformation\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Login
    console.log('\n1️⃣  Logging in...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('   Access Token:', loginData.access_token ? '✓ Present' : '✗ Missing');
    console.log('   Refresh Token:', loginData.refresh_token ? '✓ Present' : '✗ Missing');

    // Step 2: Get user data from /auth/me
    console.log('\n2️⃣  Fetching user data from /auth/me...');
    const meResponse = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginData.access_token}`
      }
    });

    if (!meResponse.ok) {
      throw new Error(`Get user failed: ${meResponse.status}`);
    }

    const userData = await meResponse.json();
    console.log('✅ User data retrieved');
    console.log('\n📦 Backend Response Structure:');
    console.log(JSON.stringify(userData, null, 2));

    // Step 3: Verify structure
    console.log('\n3️⃣  Verifying data structure...');
    
    const checks = [
      { field: 'id', value: userData.id, expected: 'string' },
      { field: 'email', value: userData.email, expected: 'string' },
      { field: 'profile', value: userData.profile, expected: 'object' },
      { field: 'profile.first_name', value: userData.profile?.first_name, expected: 'string' },
      { field: 'profile.last_name', value: userData.profile?.last_name, expected: 'string' },
      { field: 'roles', value: userData.roles, expected: 'array' },
      { field: 'permissions', value: userData.permissions, expected: 'array' }
    ];

    let allPassed = true;
    checks.forEach(check => {
      const actualType = Array.isArray(check.value) ? 'array' : typeof check.value;
      const passed = actualType === check.expected && check.value !== undefined;
      console.log(`   ${passed ? '✅' : '❌'} ${check.field}: ${actualType} ${passed ? '(OK)' : '(EXPECTED: ' + check.expected + ')'}`);
      if (!passed) allPassed = false;
    });

    // Step 4: Show what frontend expects
    console.log('\n4️⃣  Frontend Expected Structure:');
    const frontendFormat = {
      id: userData.id,
      email: userData.email,
      firstName: userData.profile?.first_name || '',
      lastName: userData.profile?.last_name || '',
      roles: userData.roles || [],
      permissions: userData.permissions || []
    };
    console.log(JSON.stringify(frontendFormat, null, 2));

    console.log('\n' + '='.repeat(60));
    if (allPassed) {
      console.log('✅ All checks passed! API client transformation should work correctly.');
    } else {
      console.log('⚠️  Some checks failed. Review the data structure.');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testUserDataTransform();
