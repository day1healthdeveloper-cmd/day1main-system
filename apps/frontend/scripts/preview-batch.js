const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map broker names from Excel to our correct broker_code in database
const BROKER_NAME_MAP = {
  'Parabellum': 'PAR',
  'Day1 Health Direct': 'DAY1',
  'DAY1 HEALTH': 'DAY1',
  'DAY1 CLINIC': 'DAY1',
  'DAY1 HEALTH OUTBOUND-DBN': 'MAM',
  'MEDSAFU BROKERS': 'MED',
  'MEDSAFU BROKERS MONTANA': 'MBM',
  'DAY1 NAVIGATOR 1': 'NAV',
  'DAY1 NAVIGATOR 2': 'NAV',
  'NAVIGATOR': 'NAV',
  'RICHARD BLACKMAN - DIRECT': 'DAY1',
  'RICHARD BLACKMAN': 'DAY1',
  'ARC BPO (Pty) Ltd': 'ARC',
  'MKT Marketing SA (Pty) Ltd': 'MKT',
  'Assurity Insurance Brokers': 'AIB',
  'Agentsy BPO (Pty) ltd': 'BPO',
  'ALL MY T SERVICED (PTY) LTD': 'MTS',
  'Boulderson': 'BOU',
  'ANNA KOTZE CONSULT (PTY) LTD': 'DAY1',
  'CSS Credit Solutions Services': 'CSS',
  'FOSCHINI RETAIL GROUP (PTY) LTD': 'TFG',
  'TeleDirect': 'TLD',
  '360 FINANCIAL SERVICE': 'THR',
  'ACUMEN HOLDINGS (PTY) LTD': 'ACU',
  'Right Cover Online': 'RCO',
};

async function previewBatch(filePath, startRow, batchSize = 20) {
  console.log('Reading Excel file...');
  const workbook = XLSX.readFile(filePath);
  const sheetName = 'Sheet1';
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const endRow = startRow + batchSize - 1;
  const rowsToProcess = data.slice(startRow - 2, endRow - 1);

  console.log(`\n=== BATCH PREVIEW: Rows ${startRow} to ${endRow} ===`);
  console.log(`Total members in this batch: ${rowsToProcess.length}\n`);

  // Get all brokers for reference
  const { data: brokers } = await supabase
    .from('brokers')
    .select('id, code, name, policy_prefix');

  const preview = [];

  for (let i = 0; i < rowsToProcess.length; i++) {
    const row = rowsToProcess[i];
    const rowNumber = startRow + i;

    const brokerName = row['broker name'];
    const memberNumber = row['Member Number'];
    const firstName = row['first names'];
    const lastName = row['last name'];
    const email = row['Email'];
    const phone = row['Phone num'];
    const status = row['Status'];

    // My logic for broker mapping
    let suggestedBrokerCode = BROKER_NAME_MAP[brokerName] || null;
    
    // Try to match by member number prefix
    const memberPrefix = memberNumber?.toString().match(/^[A-Z]+/)?.[0];
    const matchingBroker = brokers?.find(b => 
      b.policy_prefix && memberPrefix && 
      memberPrefix.toUpperCase().startsWith(b.policy_prefix.toUpperCase())
    );

    if (matchingBroker && !suggestedBrokerCode) {
      suggestedBrokerCode = matchingBroker.code;
    }

    preview.push({
      row: rowNumber,
      memberNumber,
      firstName,
      lastName,
      email,
      phone,
      status,
      excelBroker: brokerName,
      memberPrefix,
      suggestedCode: suggestedBrokerCode || '❌ UNMAPPED',
      matchedBy: matchingBroker ? `prefix:${matchingBroker.policy_prefix}` : (BROKER_NAME_MAP[brokerName] ? 'name' : 'none')
    });
  }

  // Display in table format
  console.log('Row | Member Number    | Name                          | Excel Broker                | Prefix | → My Suggestion | Match');
  console.log('----+------------------+-------------------------------+-----------------------------+--------+-----------------+--------');
  
  preview.forEach(p => {
    const row = p.row.toString().padStart(3);
    const memberNum = (p.memberNumber || '').padEnd(16);
    const name = `${p.firstName} ${p.lastName}`.substring(0, 29).padEnd(29);
    const broker = (p.excelBroker || '').substring(0, 27).padEnd(27);
    const prefix = (p.memberPrefix || '').padEnd(6);
    const suggestion = p.suggestedCode.padEnd(15);
    const match = p.matchedBy;
    
    console.log(`${row} | ${memberNum} | ${name} | ${broker} | ${prefix} | ${suggestion} | ${match}`);
  });

  console.log('\n=== SUMMARY ===');
  const mapped = preview.filter(p => p.suggestedCode !== '❌ UNMAPPED').length;
  const unmapped = preview.filter(p => p.suggestedCode === '❌ UNMAPPED').length;
  console.log(`Mapped: ${mapped}`);
  console.log(`Unmapped: ${unmapped}`);
  
  if (unmapped > 0) {
    console.log('\n⚠️  UNMAPPED MEMBERS:');
    preview.filter(p => p.suggestedCode === '❌ UNMAPPED').forEach(p => {
      console.log(`  Row ${p.row}: ${p.firstName} ${p.lastName} (${p.memberNumber}) - Excel: "${p.excelBroker}"`);
    });
  }

  console.log('\n📋 Review the mapping above. If correct, I will insert these 20 members.');
  console.log('If you need corrections, tell me which rows and what broker code to use.');
}

const filePath = process.argv[2] || '../../docs/all members list.xlsx';
const startRow = parseInt(process.argv[3]) || 2;
const batchSize = parseInt(process.argv[4]) || 20;

previewBatch(filePath, startRow, batchSize)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Preview failed:', error);
    process.exit(1);
  });
