/**
 * Try to retrieve master file data from Netcash
 */

require('dotenv').config({ path: 'apps/backend/.env.netcash' });
const axios = require('axios');

async function checkMasterFile() {
  console.log('🔍 Checking Netcash Master File Data\n');
  console.log('='.repeat(60));

  const serviceKey = process.env.NETCASH_SERVICE_KEY;
  
  console.log(`\n📋 Service Key: ${serviceKey.substring(0, 8)}...`);

  // Try RequestMandateData method
  try {
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <RequestMandateData xmlns="http://tempuri.org/">
      <ServiceKey>${serviceKey}</ServiceKey>
    </RequestMandateData>
  </soap:Body>
</soap:Envelope>`;

    console.log('\n🔄 Requesting mandate data...');
    
    const response = await axios.post(
      'https://ws.netcash.co.za/NIWS/NIWS_NIF.svc',
      soapEnvelope,
      {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/INIWS_NIF/RequestMandateData',
        },
        timeout: 30000,
      }
    );

    console.log('\n✅ Response received!');
    console.log('='.repeat(60));
    console.log(response.data);

  } catch (error) {
    console.error('\n❌ RequestMandateData failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }

  // Try RetrieveMandateData method
  try {
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <RetrieveMandateData xmlns="http://tempuri.org/">
      <ServiceKey>${serviceKey}</ServiceKey>
      <AccountReference>testy1</AccountReference>
    </RetrieveMandateData>
  </soap:Body>
</soap:Envelope>`;

    console.log('\n\n🔄 Retrieving mandate data for account "testy1"...');
    
    const response = await axios.post(
      'https://ws.netcash.co.za/NIWS/NIWS_NIF.svc',
      soapEnvelope,
      {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/INIWS_NIF/RetrieveMandateData',
        },
        timeout: 30000,
      }
    );

    console.log('\n✅ Response received!');
    console.log('='.repeat(60));
    console.log(response.data);

  } catch (error) {
    console.error('\n❌ RetrieveMandateData failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

checkMasterFile();
