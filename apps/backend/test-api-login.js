const https = require('http');

const testUsers = [
  { email: 'admin@day1main.com', password: 'admin123', role: 'System Admin' },
  { email: 'member@day1main.com', password: 'member123', role: 'Member' },
  { email: 'broker@day1main.com', password: 'broker123', role: 'Broker' },
  { email: 'assessor@day1main.com', password: 'assessor123', role: 'Claims Assessor' },
  { email: 'compliance@day1main.com', password: 'compliance123', role: 'Compliance Officer' },
  { email: 'finance@day1main.com', password: 'finance123', role: 'Finance Manager' },
];

function testApiLogin(email, password, expectedRole) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ email, password });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    console.log(`\n🔍 Testing API: ${email} (${expectedRole})`);

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log(`   ✅ SUCCESS (${res.statusCode})`);
            console.log(`      User: ${response.user?.email}`);
            console.log(`      Roles: ${response.user?.roles?.join(', ')}`);
            console.log(`      Token: ${response.access_token ? 'Present' : 'Missing'}`);
            resolve(true);
          } else {
            console.log(`   ❌ FAILED (${res.statusCode})`);
            console.log(`      Error: ${response.message || JSON.stringify(response)}`);
            resolve(false);
          }
        } catch (err) {
          console.log(`   ❌ FAILED (${res.statusCode})`);
          console.log(`      Response: ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ REQUEST ERROR: ${err.message}`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

async function testAllApiLogins() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔐 TESTING BACKEND API LOGIN ENDPOINTS');
  console.log('═══════════════════════════════════════════════════════');

  let successCount = 0;
  let failCount = 0;

  for (const testUser of testUsers) {
    const success = await testApiLogin(testUser.email, testUser.password, testUser.role);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 API TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Successful: ${successCount}/${testUsers.length}`);
  console.log(`❌ Failed: ${failCount}/${testUsers.length}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (failCount === 0) {
    console.log('🎉 All API logins working correctly!\n');
  } else {
    console.log('⚠️  Some API logins failed - check backend logs\n');
  }
}

testAllApiLogins();
