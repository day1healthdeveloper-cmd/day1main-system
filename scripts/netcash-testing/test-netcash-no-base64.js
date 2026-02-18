/**
 * Test Netcash API WITHOUT base64 encoding
 * As per Netcash support instruction
 */

const axios = require('axios');

const SERVICE_KEY = '657eb988-5345-45f7-a5e5-07a1a586155f';
const SOFTWARE_VENDOR_KEY = '24ade73c-98cf-47b3-99be-cc7b867b3080';
const API_URL = 'https://ws.netcash.co.za/NIWS/niws_nif.svc';

console.log('🧪 Testing Netcash API WITHOUT base64 encoding\n');
console.log(`Service Key: ${SERVICE_KEY}`);
console.log(`API URL: ${API_URL}\n`);

// Calculate proper future date (at least 3 business days ahead)
function getFutureDate() {
  const date = new Date();
  let businessDays = 0;
  
  while (businessDays < 3) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}${month}${day}`;
}

async function testUpload() {
  try {
    const actionDate = getFutureDate();
    const batchName = 'TEST_NO_BASE64_' + Date.now();
    
    console.log('1️⃣ Generating test batch...');
    console.log(`   Batch name: ${batchName}`);
    console.log(`   Action date: ${actionDate} (3 business days ahead)\n`);
    
    // Generate batch file content
    const lines = [];
    lines.push(['H', SERVICE_KEY, '1', 'TwoDay', batchName, actionDate, SOFTWARE_VENDOR_KEY].join('\t'));
    lines.push(['K', '101', '102', '131', '132', '133', '134', '135', '136', '137', '162', '201', '301', '302', '303'].join('\t'));
    lines.push(['T', 'testy1', 'Test Account', '1', 'Test Account', '2', '632005', '0', '123456789', '', '50000', 'test@example.com', 'D1BOU', 'BOU10001', actionDate].join('\t'));
    lines.push(['F', '1', '50000', '9999'].join('\t'));
    
    const batchContent = lines.join('\r\n');
    
    console.log('2️⃣ Batch content:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(batchContent);
    console.log('─────────────────────────────────────────────────────────\n');
    
    // Create SOAP envelope WITHOUT base64 encoding
    console.log('3️⃣ Creating SOAP envelope (NO base64)...');
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <BatchFileUpload xmlns="http://tempuri.org/">
      <ServiceKey>${SERVICE_KEY}</ServiceKey>
      <File>${batchContent}</File>
    </BatchFileUpload>
  </soap:Body>
</soap:Envelope>`;
    
    console.log('   ✅ SOAP created with plain text file content\n');
    
    // Upload to Netcash
    console.log('4️⃣ Uploading to Netcash...\n');
    
    const response = await axios.post(API_URL, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/INIWS_NIF/BatchFileUpload',
      },
      timeout: 60000,
    });
    
    console.log('5️⃣ Response received:');
    console.log(`   Status: ${response.status} ${response.statusText}\n`);
    console.log('   Response data:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(response.data);
    console.log('─────────────────────────────────────────────────────────\n');
    
    // Parse result
    const resultMatch = response.data.match(/<BatchFileUploadResult>([^<]*)<\/BatchFileUploadResult>/);
    const resultCode = resultMatch ? resultMatch[1] : 'NOT FOUND';
    
    console.log('6️⃣ Result:');
    console.log(`   Code: ${resultCode}\n`);
    
    if (resultCode === '200') {
      console.log('✅ SUCCESS! Batch uploaded successfully!');
      console.log('   - Service key works');
      console.log('   - File format is correct');
      console.log('   - NO base64 encoding works');
      console.log('   - Action date is valid\n');
    } else if (resultCode === '100') {
      console.log('❌ ERROR 100: Authentication failure\n');
    } else {
      console.log(`⚠️  Result code: ${resultCode}\n`);
    }
    
  } catch (error) {
    console.error('❌ Upload failed!\n');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response:\n`);
      console.error(error.response.data);
      console.error('\n');
    } else {
      console.error(`   Error: ${error.message}\n`);
    }
  }
}

console.log('═══════════════════════════════════════════════════════════');
console.log('NETCASH API TEST - NO BASE64 ENCODING');
console.log('═══════════════════════════════════════════════════════════\n');

testUpload().then(() => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');
});
