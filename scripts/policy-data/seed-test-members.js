const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

const testNames = [
  'SMITH J', 'JONES M', 'WILLIAMS P', 'BROWN S', 'DAVIS R',
  'MILLER T', 'WILSON K', 'MOORE L', 'TAYLOR N', 'ANDERSON C'
];

const premiums = [565, 665, 855, 931, 1131, 1397, 1724, 2254, 2512, 2906];

async function seedTestMembers() {
  console.log('🌱 Seeding test members for all broker groups...\n');
  
  // Get all brokers except DAY1
  const response = await fetch(`${SUPABASE_URL}/rest/v1/brokers?code=neq.DAY1&select=id,code,name,policy_prefix`, {
    headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Content-Type': 'application/json' }
  });
  const brokers = await response.json();
  
  console.log(`Found ${brokers.length} broker groups\n`);
  
  const allMembers = [];
  
  for (const broker of brokers) {
    console.log(`${broker.code} - ${broker.name}`);
    
    for (let i = 0; i < 10; i++) {
      const nameParts = testNames[i].split(' ');
      const lastName = nameParts[0];
      const initial = nameParts[1];
      const policyNumber = `${broker.policy_prefix}${10001 + i}`;
      
      allMembers.push({
        member_number: policyNumber,
        id_number: `TEMP${policyNumber}`,
        date_of_birth: '1980-01-01',
        email: `${policyNumber.toLowerCase()}@temp.day1health.co.za`,
        mobile: '0000000000',
        first_name: initial,
        last_name: lastName,
        broker_group: broker.code,
        broker_id: broker.id,
        monthly_premium: premiums[i],
        debit_order_day: 2,
        payment_status: 'active',
        status: 'active',
        created_at: new Date().toISOString()
      });
    }
  }
  
  console.log(`\nImporting ${allMembers.length} test members...`);
  
  const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/members`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=ignore-duplicates'
    },
    body: JSON.stringify(allMembers)
  });
  
  if (insertResponse.ok || insertResponse.status === 201) {
    console.log('✅ Done!');
    console.log('\nSummary:');
    console.log(`  ${brokers.length} broker groups`);
    console.log(`  10 members per group`);
    console.log(`  ${allMembers.length} total test members`);
  } else {
    console.error('❌ Failed:', await insertResponse.text());
  }
}

seedTestMembers();
