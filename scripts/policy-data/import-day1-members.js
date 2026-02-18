/**
 * Import DAY1 Members from Qsure Statement
 * Paste data from PDF and it will import to database
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

// PASTE YOUR DATA HERE (from PDF)
// Format: Date | Description | Reference | Debit Amount | Credit Amount | Balance
const RAW_DATA = `
2026-01-02 Collection POTGIETER H DAY1012451 R 1,369.00 R 33,472.00
2026-01-02 Collection DE WET J DAY17054734 R 565.00 R 34,037.00
2026-01-02 Collection TSATSI S DAY17043399 R 565.00 R 34,602.00
2026-01-02 Collection RAJAGOPAUL L DAY1P00644 R 420.00 R 35,022.00
2026-01-02 Collection HATTINGH T DAY17054495 R 565.00 R 35,587.00
2026-01-02 Collection WEITSZ V DAY10015836 R 565.00 R 36,152.00
2026-01-02 Collection PETERSEN E DAY17055414 R 1,750.00 R 37,902.00
2026-01-02 Collection LINDEREN P DAY1004758 R 420.00 R 38,322.00
2026-01-02 Collection TUDHOPE R DAY10015417 R 954.00 R 39,276.00
2026-01-02 Collection STOVELL S DAY17006974 R 325.00 R 39,601.00
2026-01-02 Collection KRUGER G DAY17013964 R 1,253.00 R 40,854.00
2026-01-02 Collection PEENS T DAY17014984 R 1,397.00 R 42,251.00
2026-01-02 Collection NGOBESE T DAY17037924 R 875.00 R 43,126.00
2026-01-02 Collection OBERMEYER J DAY17042118 R 640.00 R 43,766.00
2026-01-02 Collection GOVENDEN S DAY17054663 R 855.00 R 44,621.00
`;

async function parseAndImport() {
  console.log('📥 IMPORTING DAY1 MEMBERS');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Get DAY1 broker ID
    console.log('🔍 Getting DAY1 broker ID...');
    const brokerResponse = await fetch(`${SUPABASE_URL}/rest/v1/brokers?code=eq.DAY1&select=id`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const brokers = await brokerResponse.json();
    if (!brokers || brokers.length === 0) {
      console.error('❌ DAY1 broker not found!');
      process.exit(1);
    }

    const brokerId = brokers[0].id;
    console.log(`✅ DAY1 broker ID: ${brokerId}`);
    console.log('');

    // Parse the data
    console.log('🔍 Parsing member data...');
    const lines = RAW_DATA.trim().split('\n').filter(line => line.trim());
    const members = [];

    for (const line of lines) {
      // Parse line format: Date Collection NAME POLICY_NUMBER R AMOUNT R BALANCE
      const match = line.match(/Collection\s+([A-Z\s]+?)\s+(DAY1\d+)\s+R\s+([\d,]+\.\d{2})/);
      
      if (match) {
        const name = match[1].trim();
        const policyNumber = match[2];
        const amount = parseFloat(match[3].replace(',', ''));

        // Split name into parts (last word is usually initial or last name)
        const nameParts = name.split(' ');
        const lastName = nameParts[0]; // First word is usually surname
        const initial = nameParts[nameParts.length - 1]; // Last word is usually initial

        members.push({
          member_number: policyNumber,
          id_number: `TEMP${policyNumber}`, // Placeholder - will be updated later
          date_of_birth: '1980-01-01', // Placeholder - will be updated later
          email: `${policyNumber.toLowerCase()}@temp.day1health.co.za`, // Placeholder
          mobile: '0000000000', // Placeholder - will be updated later
          first_name: initial,
          last_name: lastName,
          broker_group: 'DAY1',
          broker_id: brokerId,
          monthly_premium: amount,
          debit_order_day: 2,
          payment_status: 'active',
          status: 'active',
          created_at: new Date().toISOString()
        });
      }
    }

    console.log(`✅ Parsed ${members.length} member records`);
    console.log('');

    if (members.length === 0) {
      console.log('⚠️  No members found. Check the RAW_DATA format.');
      return;
    }

    // Show sample
    console.log('📊 Sample records (first 3):');
    members.slice(0, 3).forEach((m, idx) => {
      console.log(`${idx + 1}. ${m.first_name} ${m.last_name}`);
      console.log(`   Policy: ${m.member_number}`);
      console.log(`   Premium: R ${m.monthly_premium}`);
      console.log('');
    });

    // Import to database
    console.log('💾 Importing to database...');
    
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/members`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates'
      },
      body: JSON.stringify(members)
    });

    if (insertResponse.ok || insertResponse.status === 201) {
      console.log(`✅ Successfully imported ${members.length} members!`);
    } else {
      const error = await insertResponse.text();
      console.error(`❌ Import failed: ${insertResponse.status}`);
      console.error(error);
    }

    console.log('');
    console.log('✅ IMPORT COMPLETE!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Paste more data from PDF pages');
    console.log('2. Run this script again');
    console.log('3. Repeat until all 67 pages are imported');

  } catch (error) {
    console.error('❌ Import failed!');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

parseAndImport();
