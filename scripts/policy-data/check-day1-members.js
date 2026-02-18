const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function check() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/members?broker_group=eq.DAY1&select=member_number,first_name,last_name,monthly_premium`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Prefer': 'count=exact' }
  });
  
  const count = response.headers.get('content-range');
  const data = await response.json();
  
  console.log(`Total DAY1 members: ${count ? count.split('/')[1] : data.length}`);
  console.log('\nFirst 10:');
  data.slice(0, 10).forEach((m, i) => {
    console.log(`${i+1}. ${m.first_name} ${m.last_name} - ${m.member_number} - R${m.monthly_premium}`);
  });
}

check();
