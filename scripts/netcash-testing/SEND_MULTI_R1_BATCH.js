const axios = require('axios');

const SERVICE_KEY = '657eb988-5345-45f7-a5e5-07a1a586155f';
const SOFTWARE_VENDOR_KEY = '24ade73c-98cf-47b3-99be-cc7b867b3080';
const API_URL = 'https://ws.netcash.co.za/NIWS/niws_nif.svc';

function getFutureDate() {
  const date = new Date();
  let businessDays = 0;
  while (businessDays < 3) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) businessDays++;
  }
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

async function sendBatch(memberCount) {
  const actionDate = getFutureDate();
  const batchName = 'SPUTNIK_' + Date.now();
  
  console.log(`\n🚀 Sending batch: ${batchName}`);
  console.log(`   Members: ${memberCount}`);
  console.log(`   Amount per member: R1.00 (100 cents)`);
  console.log(`   Total: R${memberCount}.00\n`);
  
  const lines = [];
  lines.push(['H', SERVICE_KEY, '1', 'TwoDay', batchName, actionDate, SOFTWARE_VENDOR_KEY].join('\t'));
  lines.push(['K', '101', '102', '131', '132', '133', '134', '135', '136', '137', '162', '201', '301', '302', '303'].join('\t'));
  
  // Add transaction lines for each member
  let totalAmount = 0;
  for (let i = 1; i <= memberCount; i++) {
    const memberNum = `SPUTNIK${i}`;
    const accountNum = String(i + 1); // Account numbers 2, 3, 4, etc.
    lines.push(['T', memberNum, 'Test Account', '1', 'Test Account', accountNum, '632005', '0', '123456789', '', '100', 'test@example.com', 'SPUTNIK', memberNum, actionDate].join('\t'));
    totalAmount += 100;
  }
  
  lines.push(['F', String(memberCount), String(totalAmount), '9999'].join('\t'));
  
  const batchContent = lines.join('\r\n');
  
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <BatchFileUpload xmlns="http://tempuri.org/">
      <ServiceKey>${SERVICE_KEY}</ServiceKey>
      <File>${batchContent}</File>
    </BatchFileUpload>
  </soap:Body>
</soap:Envelope>`;
  
  try {
    const response = await axios.post(API_URL, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/INIWS_NIF/BatchFileUpload',
      },
      timeout: 60000,
    });
    
    const resultMatch = response.data.match(/<BatchFileUploadResult>([^<]*)<\/BatchFileUploadResult>/);
    const resultCode = resultMatch ? resultMatch[1] : 'NOT FOUND';
    
    console.log(`   ✅ SUCCESS!`);
    console.log(`   Netcash Reference: ${resultCode}`);
    console.log(`   Batch Name: ${batchName}`);
    
    return { success: true, batchName, resultCode };
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function sendMultipleBatches() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 SENDING MULTIPLE TEST BATCHES');
  console.log('═══════════════════════════════════════════════════════════');
  
  // Send 3 batches with different member counts
  await sendBatch(1); // 1 member, R1.00 total
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
  await sendBatch(2); // 2 members, R2.00 total
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await sendBatch(3); // 3 members, R3.00 total
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ ALL BATCHES SENT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n📝 NEXT STEPS:');
  console.log('   1. Check Netcash portal to authorize batches');
  console.log('   2. View transactions in UI: http://localhost:3001/operations/debit-orders');
  console.log('   3. Test transaction tracking and filtering\n');
}

sendMultipleBatches();
