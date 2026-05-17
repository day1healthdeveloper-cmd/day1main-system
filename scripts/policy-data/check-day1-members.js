const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_ANON_KEY) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY");

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
