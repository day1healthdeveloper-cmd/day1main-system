const fs = require('fs');
const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function importMissing() {
  console.log('📥 Importing missing members...\n');
  
  // Get broker ID
  const brokerResp = await fetch(`${SUPABASE_URL}/rest/v1/brokers?code=eq.DAY1&select=id`, {
    headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Content-Type': 'application/json' }
  });
  const brokers = await brokerResp.json();
  const brokerId = brokers[0].id;
  
  // Get existing
  const existingResp = await fetch(`${SUPABASE_URL}/rest/v1/members?broker_group=eq.DAY1&select=member_number`, {
    headers: { 'apikey': SUPABASE_ANON_KEY }
  });
  const existing = await existingResp.json();
  const existingSet = new Set(existing.map(m => m.member_number));
  
  // Parse file more carefully - match each name with its policy and amount
  const data = fs.readFileSync('day1-data.txt', 'utf8');
  const lines = data.split('\n');
  
  const records = [];
  let currentName = null;
  let currentPolicy = null;
  let currentAmount = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip rejections
    if (line.includes('Rejection')) {
      currentName = null;
      currentPolicy = null;
      currentAmount = null;
      continue;
    }
    
    // Name line
    if (line.match(/Collection\s+[A-Z]/)) {
      const m = line.match(/Collection\s+([A-Z][A-Z\s`']+)/);
      if (m) {
        currentName = m[1].trim();
      }
    }
    
    // Policy line (look ahead for policy after name)
    if (currentName && !currentPolicy && line.match(/^DAY1[A-Z0-9]+$/)) {
      currentPolicy = line;
    }
    
    // Amount line (look ahead for amount after policy)
    if (currentName && currentPolicy && !currentAmount && line.match(/^R\s+[\d,]+\.\d{2}$/)) {
      const m = line.match(/R\s+([\d,]+\.\d{2})/);
      if (m) {
        currentAmount = parseFloat(m[1].replace(',', ''));
        
        // We have all three - save it
        if (!existingSet.has(currentPolicy)) {
          records.push({
            name: currentName,
            policy: currentPolicy,
            amount: currentAmount
          });
        }
        
        // Reset for next record
        currentName = null;
        currentPolicy = null;
        currentAmount = null;
      }
    }
  }
  
  console.log(`Found ${records.length} missing records\n`);
  
  if (records.length === 0) {
    console.log('✅ All members already imported!');
    return;
  }
  
  // Convert to members
  const members = records.map(r => {
    const nameParts = r.name.split(' ');
    const lastName = nameParts[0];
    const initial = nameParts[nameParts.length - 1];
    
    return {
      member_number: r.policy,
      id_number: `TEMP${r.policy}`,
      date_of_birth: '1980-01-01',
      email: `${r.policy.toLowerCase()}@temp.day1health.co.za`,
      mobile: '0000000000',
      first_name: initial,
      last_name: lastName,
      broker_group: 'DAY1',
      broker_id: brokerId,
      monthly_premium: r.amount,
      debit_order_day: 2,
      payment_status: 'active',
      status: 'active',
      created_at: new Date().toISOString()
    };
  });
  
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
  
  console.log('\n✅ Done!');
}

importMissing();
