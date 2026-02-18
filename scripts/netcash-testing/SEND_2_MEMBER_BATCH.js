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

async function send() {
  const actionDate = getFutureDate();
  const batchName = 'SPUTNIK_' + Date.now();
  
  console.log(`Sending batch: ${batchName}`);
  console.log(`Members: 2`);
  console.log(`Amount: R1.00 each (R2.00 total)\n`);
  
  const lines = [];
  lines.push(['H', SERVICE_KEY, '1', 'TwoDay', batchName, actionDate, SOFTWARE_VENDOR_KEY].join('\t'));
  lines.push(['K', '101', '102', '131', '132', '133', '134', '135', '136', '137', '162', '201', '301', '302', '303'].join('\t'));
  lines.push(['T', 'SPUTNIK1', 'Test Account', '1', 'Test Account', '2', '632005', '0', '123456789', '', '100', 'test@example.com', 'SPUTNIK', 'SPUTNIK1', actionDate].join('\t'));
  lines.push(['T', 'SPUTNIK2', 'Test Account', '1', 'Test Account', '3', '632005', '0', '123456789', '', '100', 'test@example.com', 'SPUTNIK', 'SPUTNIK2', actionDate].join('\t'));
  lines.push(['F', '2', '200', '9999'].join('\t'));
  
  const batchContent = lines.join('\r\n');
  
  console.log('Batch content:');
  console.log(batchContent);
  console.log('');
  
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <BatchFileUpload xmlns="http://tempuri.org/">
      <ServiceKey>${SERVICE_KEY}</ServiceKey>
      <File>${batchContent}</File>
    </BatchFileUpload>
  </soap:Body>
</soap:Envelope>`;
  
  const response = await axios.post(API_URL, soapEnvelope, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://tempuri.org/INIWS_NIF/BatchFileUpload',
    },
    timeout: 60000,
  });
  
  const resultMatch = response.data.match(/<BatchFileUploadResult>([^<]*)<\/BatchFileUploadResult>/);
  const resultCode = resultMatch ? resultMatch[1] : 'NOT FOUND';
  
  console.log(`Result: ${resultCode}`);
  console.log(`Batch: ${batchName}`);
  console.log(`Total: R2.00 (2 members x R1.00)`);
}

send();
