const fs = require('fs');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_ANON_KEY) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY");

async function findMissing() {
  console.log('🔍 Finding missing members...\n');
  
  // Get existing members
  const response = await fetch(`${SUPABASE_URL}/rest/v1/members?broker_group=eq.DAY1&select=member_number`, {
    headers: { 'apikey': SUPABASE_ANON_KEY }
  });
  const existing = await response.json();
  const existingSet = new Set(existing.map(m => m.member_number));
  
  console.log(`Existing in DB: ${existingSet.size}`);
  
  // Get all from file
  const data = fs.readFileSync('day1-data.txt', 'utf8');
  const lines = data.split('\n');
  
  const allPolicies = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t.includes('Rejection') && t.match(/^DAY1[A-Z0-9]+$/)) {
      allPolicies.push(t);
    }
  }
  
  const uniquePolicies = [...new Set(allPolicies)];
  console.log(`In file: ${uniquePolicies.length}`);
  
  // Find missing
  const missing = uniquePolicies.filter(p => !existingSet.has(p));
  console.log(`Missing: ${missing.length}\n`);
  
  if (missing.length > 0) {
    console.log('Missing policy numbers:');
    missing.slice(0, 20).forEach(p => console.log(`  ${p}`));
    if (missing.length > 20) console.log(`  ... and ${missing.length - 20} more`);
    
    // Save to file
    fs.writeFileSync('missing-policies.txt', missing.join('\n'));
    console.log('\n✅ Saved to missing-policies.txt');
  }
}

findMissing();
