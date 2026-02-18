/**
 * ⭐⭐⭐ NETCASH CORRECT FORMAT - SEND SPUTNIK TEST BATCH ⭐⭐⭐
 * 
 * THIS IS THE WORKING FORMAT THAT WAS TESTED SUCCESSFULLY!
 * DO NOT CHANGE THE FORMAT - IT WORKS!
 * 
 * Updated: R1.00 amounts to stay under R100 test limits
 * 
 * Run: node NETCASH_CORRECT_FORMAT_SEND_SPUTNIK.js
 */

const axios = require('axios');

const SERVICE_KEY = '657eb988-5345-45f7-a5e5-07a1a586155f';
const SOFTWARE_VENDOR_KEY = '24ade73c-98cf-47b3-99be-cc7b867b3080';
const API_URL = 'https://ws.netcash.co.za/NIWS/niws_nif.svc';

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

console.log('═══════════════════════════════════════════════════════════');
console.log('🚀 SENDING SPUTNIK TEST BATCH - CORRECT FORMAT');
console.log('═══════════════════════════════════════════════════════════\n');

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

async function sendSputnikBatch() {
  try {
    const actionDate = getFutureDate();
    const batchName = 'SPUTNIK_' + Date.now();
    
    console.log('1️⃣ Batch Details:');
    console.log(`   Batch name: ${batchName}`);
    console.log(`   Action date: ${actionDate} (3 business days ahead)`);
    console.log(`   Service key: ${SERVICE_KEY}\n`);
    
    // Use EXACT test data format that worked - R1.00 to stay under limits
    console.log('2️⃣ Creating test member (EXACT format - R1.00 amount)...');
    const members = [
      {
        member_number: 'SPUTNIK1',
        first_name: 'Test',
        last_name: 'Account',
        account_holder_name: 'Test Account',
        account_number: '2',
        branch_code: '632005',
        id_number: '123456789',
        monthly_premium: 1, // R1.00 to stay under R100 limit
        email: 'test@example.com',
        broker_group: 'SPUTNIK'
      }
    ];
    
    console.log(`   ✅ Created ${members.length} test member (R1.00 amount)\n`);
    
    // Generate batch file content using EXACT format that worked
    console.log('3️⃣ Generating batch file...');
    const lines = [];
    
    // Header line
    lines.push(['H', SERVICE_KEY, '1', 'TwoDay', batchName, actionDate, SOFTWARE_VENDOR_KEY].join('\t'));
    
    // Column headers
    lines.push(['K', '101', '102', '131', '132', '133', '134', '135', '136', '137', '162', '201', '301', '302', '303'].join('\t'));
    
    // Transaction lines - EXACT format that worked
    let totalAmount = 0;
    members.forEach(member => {
      const amount = Math.round((member.monthly_premium || 0) * 100); // Convert to cents
      totalAmount += amount;
      
      lines.push([
        'T',
        member.member_number,
        member.account_holder_name,
        '1', // Account type (1=Cheque, 2=Savings)
        member.account_holder_name,
        member.account_number, // Simple account number like '2', '3', etc
        member.branch_code,
        '0', // Reserved
        member.id_number,
        '', // Reserved
        amount.toString(),
        member.email,
        member.broker_group,
        member.member_number,
        actionDate
      ].join('\t'));
    });
    
    // Footer line
    lines.push(['F', members.length.toString(), totalAmount.toString(), '9999'].join('\t'));
    
    const batchContent = lines.join('\r\n');
    
    console.log('   ✅ Batch file generated');
    console.log(`   Members: ${members.length}`);
    console.log(`   Total amount: R${(totalAmount / 100).toFixed(2)}\n`);
    
    console.log('4️⃣ Batch content:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(batchContent);
    console.log('─────────────────────────────────────────────────────────\n');
    
    // Create SOAP envelope WITHOUT base64 encoding (EXACT format that worked)
    console.log('5️⃣ Creating SOAP envelope (NO base64)...');
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <BatchFileUpload xmlns="http://tempuri.org/">
      <ServiceKey>${SERVICE_KEY}</ServiceKey>
      <File>${batchContent}</File>
    </BatchFileUpload>
  </soap:Body>
</soap:Envelope>`;
    
    console.log('   ✅ SOAP envelope created\n');
    
    // Upload to Netcash
    console.log('6️⃣ Uploading to Netcash...\n');
    
    const uploadResponse = await axios.post(API_URL, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/INIWS_NIF/BatchFileUpload',
      },
      timeout: 60000,
    });
    
    console.log('7️⃣ Response received:');
    console.log(`   Status: ${uploadResponse.status} ${uploadResponse.statusText}\n`);
    
    // Parse result
    const resultMatch = uploadResponse.data.match(/<BatchFileUploadResult>([^<]*)<\/BatchFileUploadResult>/);
    const resultCode = resultMatch ? resultMatch[1] : 'NOT FOUND';
    
    console.log('8️⃣ Result:');
    console.log(`   Code: ${resultCode}\n`);
    
    // Netcash returns batch reference number on success (not just "200")
    if (resultCode && resultCode !== '100' && resultCode !== 'NOT FOUND') {
      console.log('✅ SUCCESS! SPUTNIK batch uploaded to Netcash!');
      console.log(`   Netcash Batch Reference: ${resultCode}\n`);
      
      // Save to database
      console.log('9️⃣ Saving to database...');
      
      const runData = {
        batch_name: batchName,
        run_date: new Date().toISOString(),
        batch_type: 'monthly',
        status: 'submitted',
        total_members: members.length,
        total_amount: totalAmount / 100,
        netcash_batch_reference: batchName,
        netcash_status: 'submitted',
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const createRunResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/debit_order_runs`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(runData)
        }
      );
      
      const [run] = await createRunResponse.json();
      console.log(`   ✅ Run saved: ${run.id}\n`);
      
      // Create transactions
      const transactions = members.map(member => ({
        run_id: run.id,
        member_id: null, // Will be linked later
        member_number: member.member_number,
        member_name: `${member.first_name} ${member.last_name}`,
        account_reference: member.member_number,
        amount: member.monthly_premium || 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      await fetch(
        `${SUPABASE_URL}/rest/v1/debit_order_transactions`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(transactions)
        }
      );
      
      console.log(`   ✅ ${transactions.length} transactions saved\n`);
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ SPUTNIK BATCH SENT SUCCESSFULLY');
      console.log('═══════════════════════════════════════════════════════\n');
      
      console.log('📋 BATCH SUMMARY:');
      console.log(`   Run ID: ${run.id}`);
      console.log(`   Batch Name: ${batchName}`);
      console.log(`   Members: ${members.length}`);
      console.log(`   Total Amount: R${(totalAmount / 100).toFixed(2)}`);
      console.log(`   Action Date: ${actionDate}`);
      console.log(`   Status: Submitted to Netcash\n`);
      
      console.log('📝 NEXT STEPS:');
      console.log('   1. Check Netcash portal for authorization');
      console.log('   2. Run: node supabase/check-sputnik-batch.js');
      console.log('   3. Test transaction tracking in UI');
      console.log('   4. Test failed payment handling\n');
      
    } else if (resultCode === '100') {
      console.log('❌ ERROR 100: Authentication failure\n');
    } else {
      console.log(`⚠️  Result code: ${resultCode}\n`);
      console.log('Response data:');
      console.log(uploadResponse.data);
      console.log('\n');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR!\n');
    
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

sendSputnikBatch();
