const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeExcel(filePath) {
  console.log('Reading Excel file...');
  const workbook = XLSX.readFile(filePath);
  
  console.log(`\n=== EXCEL FILE ANALYSIS ===`);
  console.log(`Available sheets: ${workbook.SheetNames.join(', ')}`);
  
  // Use Sheet1 instead of first sheet (which might be Summary)
  const sheetName = 'Sheet1';
  console.log(`Analyzing sheet: ${sheetName}`);
  
  const sheet = workbook.Sheets[sheetName];
  
  // Get the range to see actual data extent
  const range = XLSX.utils.decode_range(sheet['!ref']);
  console.log(`Sheet range: ${sheet['!ref']} (${range.e.r + 1} rows, ${range.e.c + 1} columns)`);
  
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  console.log(`Total rows with data: ${data.length}\n`);

  // Analyze broker names
  const brokerNames = new Map();
  const memberPrefixes = new Map();
  const paymentMethods = new Set();
  const statuses = new Set();

  data.forEach(row => {
    const brokerName = row['broker name'];
    const memberNumber = row['Member Number'];
    const paymentMethod = row['Payment Method'];
    const status = row['Status'];

    // Count broker names
    if (brokerName) {
      brokerNames.set(brokerName, (brokerNames.get(brokerName) || 0) + 1);
    }

    // Extract member number prefix (before numbers)
    if (memberNumber) {
      const prefix = memberNumber.toString().match(/^[A-Z]+/)?.[0] || 'UNKNOWN';
      memberPrefixes.set(prefix, (memberPrefixes.get(prefix) || 0) + 1);
    }

    if (paymentMethod) paymentMethods.add(paymentMethod);
    if (status) statuses.add(status);
  });

  // Display broker names
  console.log('=== BROKER NAMES IN EXCEL ===');
  const sortedBrokers = Array.from(brokerNames.entries()).sort((a, b) => b[1] - a[1]);
  sortedBrokers.forEach(([name, count]) => {
    console.log(`${count.toString().padStart(4)} members - ${name}`);
  });

  // Display member number prefixes
  console.log('\n=== MEMBER NUMBER PREFIXES ===');
  const sortedPrefixes = Array.from(memberPrefixes.entries()).sort((a, b) => b[1] - a[1]);
  sortedPrefixes.forEach(([prefix, count]) => {
    console.log(`${count.toString().padStart(4)} members - ${prefix}`);
  });

  // Display payment methods
  console.log('\n=== PAYMENT METHODS ===');
  Array.from(paymentMethods).sort().forEach(method => {
    console.log(`- ${method}`);
  });

  // Display statuses
  console.log('\n=== STATUSES ===');
  Array.from(statuses).sort().forEach(status => {
    console.log(`- ${status}`);
  });

  // Get our existing brokers from database
  console.log('\n=== OUR EXISTING BROKERS IN DATABASE ===');
  const { data: existingBrokers } = await supabase
    .from('brokers')
    .select('code, name, policy_prefix')
    .order('code');

  if (existingBrokers) {
    existingBrokers.forEach(broker => {
      console.log(`${broker.code.padEnd(8)} - ${broker.name.padEnd(40)} - prefix: ${broker.policy_prefix || 'none'}`);
    });
  }

  // Check for potential duplicates
  console.log('\n=== CHECKING FOR POTENTIAL DUPLICATES ===');
  console.log('Checking first 50 members against database...');
  
  let duplicateCount = 0;
  const sampleSize = Math.min(50, data.length);
  
  for (let i = 0; i < sampleSize; i++) {
    const row = data[i];
    const memberNumber = row['Member Number'];
    const firstName = row['first names'];
    const lastName = row['last name'];

    if (!memberNumber || !firstName || !lastName) continue;

    // Check by member_number
    const { data: byNumber } = await supabase
      .from('members')
      .select('member_number')
      .eq('member_number', memberNumber)
      .single();

    if (byNumber) {
      duplicateCount++;
      console.log(`DUPLICATE: ${memberNumber} - ${firstName} ${lastName}`);
    }
  }

  console.log(`\nFound ${duplicateCount} duplicates in first ${sampleSize} members`);
  console.log(`Estimated total duplicates: ~${Math.round((duplicateCount / sampleSize) * data.length)}`);

  // Suggest broker mapping
  console.log('\n=== SUGGESTED BROKER MAPPING ===');
  console.log('Based on broker names and member prefixes, here are suggested mappings:');
  console.log('(You need to verify and update the script with correct mappings)\n');
  
  sortedBrokers.forEach(([name]) => {
    console.log(`'${name}': 'BROKER_CODE_HERE',`);
  });
}

const filePath = process.argv[2] || 'all members list.xlsx';
analyzeExcel(filePath)
  .then(() => {
    console.log('\nAnalysis completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Analysis failed:', error);
    process.exit(1);
  });
