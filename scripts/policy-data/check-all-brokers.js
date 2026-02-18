const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function checkAll() {
  const brokersResp = await fetch(`${SUPABASE_URL}/rest/v1/brokers?select=code,name`, {
    headers: { 'apikey': SUPABASE_ANON_KEY }
  });
  const brokers = await brokersResp.json();
  
  console.log('📊 MEMBERS PER BROKER GROUP\n');
  
  let total = 0;
  for (const broker of brokers) {
    const membersResp = await fetch(`${SUPABASE_URL}/rest/v1/members?broker_group=eq.${broker.code}&select=member_number`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Prefer': 'count=exact' }
    });
    const count = membersResp.headers.get('content-range');
    const memberCount = count ? parseInt(count.split('/')[1]) : 0;
    total += memberCount;
    
    console.log(`${broker.code.padEnd(6)} - ${broker.name.padEnd(35)} : ${memberCount} members`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`TOTAL: ${total} members across ${brokers.length} broker groups`);
}

checkAll();
