# Netcash API Upload Implementation

## API Endpoint
```
POST https://ws.netcash.co.za/NIWS/niws_nif.svc
```

## SOAP Method
```
LegacyCompactBatchFileUpload
```

## SOAP Request Example

### Headers
```
Content-Type: text/xml; charset=utf-8
SOAPAction: http://tempuri.org/INIWS_NIF/LegacyCompactBatchFileUpload
```

### SOAP Envelope
```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <LegacyCompactBatchFileUpload xmlns="http://tempuri.org/">
      <ServiceKey>657eb988-5345-45f7-a5e5-07a1a586155f</ServiceKey>
      <File>[BASE64_ENCODED_FILE_CONTENT]</File>
    </LegacyCompactBatchFileUpload>
  </soap:Body>
</soap:Envelope>
```

## File Encoding
The batch file (NETCASH_CORRECT.txt) is:
1. Read as UTF-8 text
2. Encoded to Base64
3. Sent in the `<File>` parameter

## Response Received
```xml
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <LegacyCompactBatchFileUploadResponse xmlns="http://tempuri.org/">
      <LegacyCompactBatchFileUploadResult>200</LegacyCompactBatchFileUploadResult>
    </LegacyCompactBatchFileUploadResponse>
  </s:Body>
</s:Envelope>
```

**Result Code: 200** = "General code exception."

## Code Implementation (Node.js)

```javascript
const axios = require('axios');
const fs = require('fs');

// Read batch file
const fileContent = fs.readFileSync('test-batches/NETCASH_CORRECT.txt', 'utf8');

// Encode to Base64
const fileBase64 = Buffer.from(fileContent).toString('base64');

// Create SOAP envelope
const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <LegacyCompactBatchFileUpload xmlns="http://tempuri.org/">
      <ServiceKey>657eb988-5345-45f7-a5e5-07a1a586155f</ServiceKey>
      <File>${fileBase64}</File>
    </LegacyCompactBatchFileUpload>
  </soap:Body>
</soap:Envelope>`;

// Send request
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

console.log('Response:', response.data);
```

## Alternative Method Tested

We also tested the standard `BatchFileUpload` method with the same result:

```xml
<soap:Body>
  <BatchFileUpload xmlns="http://tempuri.org/">
    <ServiceKey>657eb988-5345-45f7-a5e5-07a1a586155f</ServiceKey>
    <File>[BASE64_ENCODED_FILE_CONTENT]</File>
  </BatchFileUpload>
</soap:Body>
```

**SOAPAction:** `http://tempuri.org/INIWS_NIF/BatchFileUpload`

**Result:** Same error code 200

## Summary

- ✅ File format confirmed working by Netcash
- ✅ SOAP API connection successful (HTTP 200 OK)
- ✅ Service key authentication (no code 100 errors)
- ❌ API returns error code 200 for all upload attempts
- ❌ Service key needs API batch upload permissions activated


