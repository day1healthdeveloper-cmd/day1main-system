/**
 * Detailed test of batch upload with full response parsing
 */

require('dotenv').config({ path: 'apps/backend/.env.netcash' });
const axios = require('axios');
const fs = require('fs');

async function detailedUpload() {
  console.log('🧪 Detailed Batch Upload Test\n');
  console.log('='.repeat(60));

  const serviceKey = process.env.NETCASH_SERVICE_KEY;
  const batchFile = 'test-batches/TEST_BATCH_20260210.txt';

  console.log(`\n📋 Configuration:`);
  console.log(`   Service Key: ${serviceKey.substring(0, 8)}...`);
  console.log(`   Batch File: ${batchFile}`);

  try {
    // Read and encode file
    const fileContent = fs.readFileSync(batchFile, 'utf8');
    const fileBase64 = Buffer.from(fileContent).toString('base64');

    console.log(`\n📄 File Details:`);
    console.log(`   Size: ${fileContent.length} bytes`);
    console.log(`   Lines: ${fileContent.split('\n').length}`);
    console.log(`   Base64 size: ${fileBase64.length} bytes`);

    // Create SOAP envelope
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <LegacyCompactBatchFileUpload xmlns="http://tempuri.org/">
      <ServiceKey>${serviceKey}</ServiceKey>
      <File>${fileBase64}</File>
    </LegacyCompactBatchFileUpload>
  </soap:Body>
</soap:Envelope>`;

    console.log('\n🚀 Uploading to Netcash...');
    
    const response = await axios.post(
      'https://ws.netcash.co.za/NIWS/niws_nif.svc',
      soapEnvelope,
      {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/INIWS_NIF/LegacyCompactBatchFileUpload',
        },
        timeout: 60000,
      }
    );

    console.log('\n✅ Upload Complete!');
    console.log('='.repeat(60));
    console.log(`\n📊 HTTP Status: ${response.status}`);
    console.log(`\n📦 Full Response:`);
    console.log(response.data);

    // Parse result code
    const resultMatch = response.data.match(/<LegacyCompactBatchFileUploadResult>(\d+)<\/LegacyCompactBatchFileUploadResult>/i);
    if (resultMatch) {
      const code = resultMatch[1];
      console.log(`\n🔢 Result Code: ${code}`);
      
      // Interpret code
      const codes = {
        '0': 'Success - Batch uploaded and processed',
        '100': 'Authentication failure - Invalid service key',
        '102': 'Parameter error - Missing or invalid parameters',
        '200': 'General code exception - Check batch format',
        '300': 'File format error',
      };
      
      console.log(`   Meaning: ${codes[code] || 'Unknown code'}`);
      
      if (code === '200') {
        console.log('\n⚠️  Code 200 indicates a general exception!');
        console.log('   This usually means there\'s an issue with the batch file format.');
        console.log('   Common issues:');
        console.log('   - Missing or invalid fields');
        console.log('   - Incorrect field spacing');
        console.log('   - Invalid account numbers or branch codes');
      }
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.response) {
      console.error('\n📋 Response:');
      console.error(error.response.data);
    }
    
    process.exit(1);
  }
}

detailedUpload();
