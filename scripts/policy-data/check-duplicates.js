const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_ANON_KEY) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY");

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
