require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCounts() {
  let allData = [];
  let from = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('members')
      .select('broker_code')
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error:', error);
      return;
    }

    if (!data || data.length === 0) break;
    
    allData = allData.concat(data);
    
    if (data.length < pageSize) break;
    from += pageSize;
  }

  const counts = {};
  allData.forEach(member => {
    const code = member.broker_code || 'NO_CODE';
    counts[code] = (counts[code] || 0) + 1;
  });

  console.log('=== All Broker Counts ===\n');
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([code, count]) => {
      console.log(`${code}: ${count} members`);
    });

  console.log(`\nTotal: ${allData.length} members`);
}

checkCounts();
