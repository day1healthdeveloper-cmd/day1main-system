const fs = require('fs');
const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function bulkImport() {
  console.log('📥 Importing DAY1 members...');

  try {
    const ALL_DATA = fs.readFileSync('day1-data.txt', 'utf8');
    
    const brokerResponse = await fetch(`${SUPABASE_URL}/rest/v1/brokers?code=eq.DAY1&select=id`, {
      headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' }
    });
    const brokers = await brokerResponse.json();
    const brokerId = brokers[0].id;

    const lines = ALL_DATA.split('\n');
    const names = [];
    const policies = [];
    const amounts = [];
    const seen = new Set();
    
    for (const line of lines) {
      const t = line.trim();
      
      // Skip rejections
      if (t.includes('Rejection')) continue;
      
      // Names: "2026-01-02 Collection NAME" or "Collection NAME"
      if (t.match(/Collection\s+[A-Z]/)) {
        const m = t.match(/Collection\s+([A-Z][A-Z\s`']+)/);
        if (m) names.push(m[1].trim());
      }
      
      // Policies: Line is ONLY "DAY1..." 
      if (t.match(/^DAY1[A-Z0-9]+$/)) {
        policies.push(t);
      }
      
      // Amounts: Line is ONLY "R amount"
      if (t.match(/^R\s+[\d,]+\.\d{2}$/)) {
        const m = t.match(/R\s+([\d,]+\.\d{2})/);
        if (m) amounts.push(parseFloat(m[1].replace(',', '')));
      }
    }
    
    console.log(`Found: ${names.length} names, ${policies.length} policies, ${amounts.length} amounts`);
    
    const members = [];
    const min = Math.min(names.length, policies.length, amounts.length);
    
    for (let i = 0; i < min; i++) {
      const policy = policies[i];
      if (seen.has(policy)) continue;
      seen.add(policy);
      
      const nameParts = names[i].split(' ');
      const lastName = nameParts[0];
      const initial = nameParts[nameParts.length - 1];

      members.push({
        member_number: policy,
        id_number: `TEMP${policy}`,
        date_of_birth: '1980-01-01',
        email: `${policy.toLowerCase()}@temp.day1health.co.za`,
        mobile: '0000000000',
        first_name: initial,
        last_name: lastName,
        broker_group: 'DAY1',
        broker_id: brokerId,
        monthly_premium: amounts[i],
        debit_order_day: 2,
        payment_status: 'active',
        status: 'active',
        created_at: new Date().toISOString()
      });
    }

    console.log(`Importing ${members.length} members...`);

    for (let i = 0; i < members.length; i += 100) {
      const batch = members.slice(i, i + 100);
      await fetch(`${SUPABASE_URL}/rest/v1/members`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=ignore-duplicates'
        },
        body: JSON.stringify(batch)
      });
      console.log(`Batch ${Math.floor(i/100) + 1}`);
    }

    console.log('✅ Done!');
  } catch (error) {
    console.error('❌', error.message);
  }
}

bulkImport();
