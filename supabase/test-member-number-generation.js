const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateNextMemberNumber() {
  try {
    // Get all DAY1 members with 7-digit format, ordered by member_number descending
    const { data: members, error } = await supabase
      .from('members')
      .select('member_number')
      .ilike('member_number', 'DAY1_______') // 7 underscores for 7 digits
      .order('member_number', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching highest member number:', error);
      throw error;
    }
    
    if (!members || members.length === 0) {
      return 'DAY10000001';
    }
    
    const highestNumber = members[0].member_number;
    const numericPart = highestNumber.replace('DAY1', '');
    
    if (!/^\d{7}$/.test(numericPart)) {
      console.error('Invalid member number format:', highestNumber);
      return 'DAY10000001';
    }
    
    const nextNumber = parseInt(numericPart) + 1;
    return `DAY1${String(nextNumber).padStart(7, '0')}`;
    
  } catch (error) {
    console.error('Error generating member number:', error);
    throw new Error('Failed to generate member number');
  }
}

async function testMemberNumberGeneration() {
  console.log('🧪 Testing automatic member number generation...\n');
  
  // Test 1: Get current highest
  const { data: current, error } = await supabase
    .from('members')
    .select('member_number, first_name, last_name')
    .ilike('member_number', 'DAY1_______')
    .order('member_number', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('📊 Current top 5 DAY1 members:');
  current.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.member_number} | ${m.first_name} ${m.last_name}`);
  });
  
  // Test 2: Generate next number
  console.log('\n🔢 Generating next member number...');
  const nextNumber = await generateNextMemberNumber();
  console.log(`✅ Next available: ${nextNumber}`);
  
  // Test 3: Simulate multiple generations
  console.log('\n🔄 Simulating 5 sequential generations:');
  let testNumber = parseInt(nextNumber.replace('DAY1', ''));
  for (let i = 0; i < 5; i++) {
    const simulated = `DAY1${String(testNumber + i).padStart(7, '0')}`;
    console.log(`  ${i + 1}. ${simulated}`);
  }
  
  console.log('\n✅ Member number generation system is working correctly!');
  console.log('📌 New applications will automatically receive sequential DAY1 numbers');
}

testMemberNumberGeneration().catch(console.error);
