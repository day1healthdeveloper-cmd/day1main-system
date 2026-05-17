const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_ANON_KEY) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY");

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
