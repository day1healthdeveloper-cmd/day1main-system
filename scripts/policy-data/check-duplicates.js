const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function checkDuplicates() {
  console.log('🔍 Checking for duplicates...\n');
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/members?broker_group=eq.DAY1&select=member_number`, {
    headers: { 'apikey': SUPABASE_ANON_KEY }
  });
  
  const members = await response.json();
  const memberNumbers = members.map(m => m.member_number);
  
  console.log(`Total DAY1 members: ${memberNumbers.length}`);
  
  // Find duplicates
  const counts = {};
  memberNumbers.forEach(num => {
    counts[num] = (counts[num] || 0) + 1;
  });
  
  const duplicates = Object.entries(counts).filter(([num, count]) => count > 1);
  
  if (duplicates.length > 0) {
    console.log(`\n❌ Found ${duplicates.length} duplicates:\n`);
    duplicates.forEach(([num, count]) => {
      console.log(`  ${num}: ${count} times`);
    });
  } else {
    console.log('\n✅ No duplicates found!');
  }
}

checkDuplicates();
