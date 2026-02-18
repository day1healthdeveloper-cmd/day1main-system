const http = require('http');

const postData = JSON.stringify({ 
  email: 'admin@day1main.com', 
  password: 'admin123' 
});

console.log('Testing login endpoint...\n');

// Test /api/v1/auth/login
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

const req = http.request(options, (res) => {
  let data = '';
  
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}\n`);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:');
    console.log(data);
  });
});

req.on('error', (err) => {
  console.error('Request Error:', err.message);
});

req.write(postData);
req.end();
