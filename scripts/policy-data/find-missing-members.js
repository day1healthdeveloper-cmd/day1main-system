const fs = require('fs');
const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

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
