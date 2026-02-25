const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map broker names from Excel to our broker_code
const BROKER_NAME_MAP = {
  'TANKARDS SERVICE': 'DAY1',
  'ACUMEN HOLDINGS (PTY) LTD': 'ACU',
  'Agentsy BPO (Pty) ltd': 'BPO',
  'ALL MY 1 SERVICE (PTY) LTD': 'MTS',
  'ALL MY T SERVICED (PTY) LTD': 'MTS',
  'ANNA KOTZE CONSULT (PTY) LTD': 'DAY1',
  'ARC BPO (Pty) Ltd': 'ARC',
  'Assurity Insurance Brokers': 'AIB',
  'Boulderson': 'BOU',
  'Buddy': 'AXS',
  'CSS Credit Solutions Services': 'CSS',
  'DAY1 CLINIC': 'DAY1',
  'DAY1 HEALTH': 'DAY1',
  'Day1 Health Direct': 'DAY1',
  'DAY1 HEALTH OUTBOUND-DBN': 'MAM',
  'DAY1 NAVIGATOR 1': 'NAV',
  'DAY1 NAVIGATOR 2': 'NAV',
  'NAVIGATOR': 'NAV',
  'FOSCHINI RETAIL GROUP (PTY) LTD': 'TFG',
  'TeleDirect': 'TLD',
  '360 FINANCIAL SERVICE': 'THR',
  'Right Cover Online': 'RCO',
  'MKT Marketing SA (Pty) Ltd': 'MKT',
  'MEDSAFU BROKERS': 'MED',
  'MEDSAFU BROKERS MONTANA': 'MBM',
  'Parabellum': 'PAR',
  'PENNSURE (PTY) LTD T/A HRS INSURANCE': 'DAY1',
  'PRAESIDIUM ASSURANCE AND INVESTMENTS (PTY) LTD': 'DAY1',
  'RICHARD BLACKMAN - DIRECT': 'DAY1',
  'RICHARD BLACKMAN': 'DAY1',
  'PROFILE CORPORATE SERVICES': 'DAY1',
  'PROPER HEALTHCARE SERVICES': 'DAY1',
  'STANLEY HUTCHESON & ASSOCIATES': 'DAY1',
  'SWEIDAN & Co. INVESTMENT & INSURANCE BROKERS': 'DAY1',
  'TN ENTERPRISES': 'DAY1',
  'ZEST LIFE': 'DAY1',
  'QUALIFIN BROKERS': 'DAY1',
  'RAINMAKER INSURANCE ADVISORS': 'DAY1',
  'REGENT GROUP SERVICES': 'DAY1',
  'SALESGENIE': 'DAY1',
  'School days': 'DAY1',
  'VITAL CONSULTS NATIONAL HOLDINGS PTY LTD': 'DAY1',
  'WILLIE': 'DAY1',
};

async function checkDuplicate(memberNumber, firstName, lastName) {
  // Check by member_number
  const { data: byNumber } = await supabase
    .from('members')
    .select('id, member_number, first_name, last_name')
    .eq('member_number', memberNumber)
    .single();

  if (byNumber) {
    return { isDuplicate: true, reason: 'member_number', existing: byNumber };
  }

  // Check by first_name + last_name (case insensitive)
  const { data: byName } = await supabase
    .from('members')
    .select('id, member_number, first_name, last_name')
    .ilike('first_name', firstName)
    .ilike('last_name', lastName);

  if (byName && byName.length > 0) {
    return { isDuplicate: true, reason: 'name_match', existing: byName[0] };
  }

  return { isDuplicate: false };
}

async function importMembers(filePath, batchSize = 15, startRow = 2, endRow = null, dryRun = false) {
  console.log('Reading Excel file...');
  const workbook = XLSX.readFile(filePath);
  // Use Sheet1 instead of first sheet (which might be Summary)
  const sheetName = 'Sheet1';
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  console.log(`Total rows in Excel: ${data.length}`);

  // Determine which rows to process
  const rowsToProcess = endRow 
    ? data.slice(startRow - 2, endRow - 1)
    : data.slice(startRow - 2, startRow - 2 + batchSize);

  console.log(`Processing rows ${startRow} to ${startRow + rowsToProcess.length - 1}`);
  console.log(`Total rows to process: ${rowsToProcess.length}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE IMPORT'}\n`);

  const results = {
    success: [],
    duplicates: [],
    errors: [],
    skipped: []
  };

  for (let i = 0; i < rowsToProcess.length; i++) {
    const row = rowsToProcess[i];
    const rowNumber = startRow + i;

    try {
      // Extract data from Excel columns
      const brokerName = row['broker name'];
      let memberNumber = row['Member Number'];
      const firstName = row['first names'];
      const lastName = row['last name'];
      const email = row['Email'];
      const phone = row['Phone num'];
      const planName = row['plan name'];
      const status = row['Status'];
      const paymentMethod = row['Payment Method'];
      
      // Fix AXE to AXS prefix
      if (memberNumber && memberNumber.toString().startsWith('AXE')) {
        const corrected = memberNumber.toString().replace(/^AXE/, 'AXS');
        console.log(`    ⚠️  Correcting AXE to AXS: ${memberNumber} → ${corrected}`);
        memberNumber = corrected;
      }
      
      // Fix PL prefix to DAY1 prefix
      if (memberNumber && memberNumber.toString().startsWith('PL')) {
        const corrected = memberNumber.toString().replace(/^PL/, 'DAY1');
        console.log(`    ⚠️  Correcting PL to DAY1: ${memberNumber} → ${corrected}`);
        memberNumber = corrected;
      }
      
      // Fix specific member numbers
      if (memberNumber === 'MED1007189') {
        memberNumber = 'PAR1007189';
        console.log(`    ⚠️  Correcting: MED1007189 → PAR1007189`);
      }
      if (memberNumber === 'DAY17035048') {
        memberNumber = 'PAR17035048';
        console.log(`    ⚠️  Correcting: DAY17035048 → PAR17035048`);
      }

      // Validate required fields
      if (!memberNumber || !firstName || !lastName) {
        results.skipped.push({
          row: rowNumber,
          reason: 'Missing required fields',
          data: { memberNumber, firstName, lastName }
        });
        console.log(`Row ${rowNumber}: SKIPPED - Missing required fields`);
        continue;
      }
      
      // Skip BSN (BrokersNet) entries
      if (memberNumber && memberNumber.toString().startsWith('BSN')) {
        results.skipped.push({
          row: rowNumber,
          reason: 'BrokersNet - not in our broker list',
          data: { memberNumber, firstName, lastName }
        });
        console.log(`Row ${rowNumber}: SKIPPED - BrokersNet entry (${firstName} ${lastName})`);
        continue;
      }

      // Check for duplicates
      const dupCheck = await checkDuplicate(memberNumber, firstName, lastName);
      if (dupCheck.isDuplicate) {
        results.duplicates.push({
          row: rowNumber,
          reason: dupCheck.reason,
          new: { memberNumber, firstName, lastName },
          existing: dupCheck.existing
        });
        console.log(`Row ${rowNumber}: DUPLICATE - ${dupCheck.reason} - ${firstName} ${lastName} (${memberNumber})`);
        continue;
      }

      // Map broker name to broker_code
      const brokerCode = BROKER_NAME_MAP[brokerName] || null;

      // Find broker_id if we have a broker_code
      let brokerId = null;
      let correctedMemberNumber = memberNumber;
      
      if (brokerCode) {
        const { data: broker } = await supabase
          .from('brokers')
          .select('id, code, policy_prefix')
          .eq('code', brokerCode)
          .single();
        
        if (broker) {
          brokerId = broker.id;
          
          // Fix member number if prefix doesn't match broker policy_prefix
          const memberPrefix = memberNumber.toString().match(/^[A-Z]+/)?.[0];
          if (broker.policy_prefix && memberPrefix && 
              memberPrefix.toUpperCase() !== broker.policy_prefix.toUpperCase()) {
            // Extract the numeric part and rebuild with correct prefix
            const numericPart = memberNumber.toString().replace(/^[A-Z]+/, '');
            correctedMemberNumber = `${broker.policy_prefix}${numericPart}`;
            console.log(`    ⚠️  Correcting: ${memberNumber} → ${correctedMemberNumber}`);
          }
        }
      }

      // Prepare member data with placeholders for missing fields
      // Generate unique placeholder ID number based on member_number
      const uniqueIdNumber = `9999${correctedMemberNumber.replace(/[^0-9]/g, '').padStart(9, '0').slice(-9)}`;
      
      const memberData = {
        member_number: correctedMemberNumber,
        first_name: firstName,
        last_name: lastName,
        id_number: uniqueIdNumber, // Unique placeholder - to be updated later
        date_of_birth: '1990-01-01', // Placeholder - to be updated later
        email: email || null,
        phone: phone || null,
        broker_code: brokerCode,
        broker_id: brokerId,
        status: status === 'Active' ? 'active' : status === 'Suspended' ? 'suspended' : status === 'In Waiting' ? 'pending' : 'pending',
        kyc_status: 'pending',
        risk_score: 0,
        monthly_premium: 385, // Default premium
        marketing_consent: false,
        email_consent: false,
        sms_consent: false,
        phone_consent: false,
        debit_order_status: 'pending',
        failed_debit_count: 0,
        total_arrears: 0,
        collection_method: 'individual_eft',
      };

      if (dryRun) {
        results.success.push({
          row: rowNumber,
          member: memberData
        });
        console.log(`Row ${rowNumber}: WOULD IMPORT - ${firstName} ${lastName} (${correctedMemberNumber}) - Broker: ${brokerCode || 'UNMAPPED'}`);
      } else {
        // Insert member
        const { data: newMember, error } = await supabase
          .from('members')
          .insert(memberData)
          .select()
          .single();

        if (error) throw error;

        results.success.push({
          row: rowNumber,
          member: newMember
        });
        console.log(`Row ${rowNumber}: SUCCESS - ${firstName} ${lastName} (${memberNumber})`);
      }

    } catch (error) {
      results.errors.push({
        row: rowNumber,
        error: error.message,
        data: row
      });
      console.log(`Row ${rowNumber}: ERROR - ${error.message}`);
    }
  }

  // Print summary
  console.log('\n=== IMPORT SUMMARY ===');
  console.log(`${dryRun ? 'Would import' : 'Successfully imported'}: ${results.success.length}`);
  console.log(`Duplicates found: ${results.duplicates.length}`);
  console.log(`Errors: ${results.errors.length}`);
  console.log(`Skipped: ${results.skipped.length}`);

  if (results.duplicates.length > 0) {
    console.log('\n=== DUPLICATES ===');
    results.duplicates.forEach(dup => {
      console.log(`Row ${dup.row}: ${dup.new.firstName} ${dup.new.lastName} - ${dup.reason}`);
      console.log(`  Existing: ${dup.existing.member_number} - ${dup.existing.first_name} ${dup.existing.last_name}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n=== ERRORS ===');
    results.errors.forEach(err => {
      console.log(`Row ${err.row}: ${err.error}`);
    });
  }

  return results;
}

// Usage
const args = process.argv.slice(2);
const filePath = args[0] || '../all members list.xlsx';
const batchSize = parseInt(args[1]) || 15;
const startRow = parseInt(args[2]) || 2;
const endRow = args[3] ? parseInt(args[3]) : null;
const dryRun = args[4] === '--dry-run';

console.log('=== MEMBER IMPORT SCRIPT ===');
console.log(`File: ${filePath}`);
console.log(`Batch size: ${batchSize}`);
console.log(`Start row: ${startRow}`);
console.log(`End row: ${endRow || 'auto (batch size)'}`);
console.log(`Dry run: ${dryRun}\n`);

importMembers(filePath, batchSize, startRow, endRow, dryRun)
  .then(() => {
    console.log('\nImport completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
  });
