const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map broker names to broker codes
const BROKER_NAME_MAP = {
  'Assurity Insurance Brokers': 'AIB',
  'ARC BPO (Pty) Ltd': 'ARC',
  'Accsure': 'AXS',
  'Day1Health Direct': 'DAY1',
  'DAY1 HEALTH': 'DAY1',
  'Parabellum': 'PAR',
  'Medi-Safu Brokers': 'MED',
  'Medi-Safu Brokers Montana': 'MBM',
  'Day1 Navigator': 'NAV',
  'Mamela': 'MAM',
  'All My T': 'MTS',
  'Agency BPO': 'BPO',
  'Acumen Holdings (PTY) LTD': 'ACU',
  'Boulderson': 'BOU',
  'CSS Credit Solutions Services': 'CSS',
  'MKT Marketing': 'MKT',
  'Right Cover Online': 'RCO',
  'The Foschini Group': 'TFG',
  'TeleDirect': 'TLD',
  '360 Financial Service': 'THR',
};

async function importMembersWithDependants(filePath, startRow = 2, endRow = null, dryRun = false) {
  console.log('📖 Reading Excel file...\n');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['Sheet1'];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  console.log(`Total rows in Excel: ${data.length}`);

  const rowsToProcess = endRow 
    ? data.slice(startRow - 2, endRow - 1)
    : data.slice(startRow - 2);

  console.log(`Processing rows ${startRow} to ${startRow + rowsToProcess.length - 1}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE IMPORT'}\n`);

  const results = {
    members: [],
    dependants: [],
    errors: [],
    skipped: []
  };

  // Group rows by member number and remove duplicates (same member_number + dependant_code)
  const memberGroupsTemp = {};
  rowsToProcess.forEach((row, idx) => {
    const memberNumber = row['MemberNumber'];
    const dependantCode = parseInt(row['DependantCode']) || 0;
    
    if (!memberGroupsTemp[memberNumber]) {
      memberGroupsTemp[memberNumber] = {};
    }
    
    // Only keep first occurrence of each dependant_code
    if (!memberGroupsTemp[memberNumber][dependantCode]) {
      memberGroupsTemp[memberNumber][dependantCode] = { row, rowIndex: startRow + idx };
    }
  });
  
  // Convert back to array format
  const memberGroups = {};
  Object.entries(memberGroupsTemp).forEach(([memberNumber, codeMap]) => {
    memberGroups[memberNumber] = Object.values(codeMap);
  });

  console.log(`Found ${Object.keys(memberGroups).length} unique members\n`);

  // Process each member group
  for (const [memberNumber, rows] of Object.entries(memberGroups)) {
    try {
      // Find the main member (dependant_code = 0 or DependantType = MainMember)
      const mainMemberRow = rows.find(r => 
        r.row['DependantCode'] === 0 || 
        r.row['DependantCode'] === '0' ||
        r.row['DependantType'] === 'MainMember'
      );

      if (!mainMemberRow) {
        results.skipped.push({
          memberNumber,
          reason: 'No main member found',
          rows: rows.length
        });
        console.log(`⚠️  ${memberNumber}: No main member found - skipping ${rows.length} rows`);
        continue;
      }

      const mainRow = mainMemberRow.row;

      // Map broker name to code
      const repName = mainRow['RepName'];
      const brokerCode = BROKER_NAME_MAP[repName] || null;

      // Get broker_id if we have a broker_code
      let brokerId = null;
      if (brokerCode) {
        const { data: broker } = await supabase
          .from('brokers')
          .select('id')
          .eq('code', brokerCode)
          .single();
        if (broker) brokerId = broker.id;
      }

      // Prepare main member data
      // Main member status determines the status for all dependants
      const mainMemberStatus = mainRow['StatusDescription']?.toLowerCase() === 'active' ? 'active' : 'inactive';
      
      const memberData = {
        member_number: memberNumber,
        dependant_code: 0,
        dependant_type: 'MainMember',
        first_name: mainRow['Name1'],
        last_name: mainRow['Surname'],
        date_of_birth: mainRow['DateOfBirth'] ? XLSX.SSF.format('yyyy-mm-dd', mainRow['DateOfBirth']) : null,
        id_number: mainRow['ID Number'] || null,
        status: mainMemberStatus,
        type: mainRow['Type'] || null,
        rep_name: repName || null,
        plan_name: mainRow['ProductName'] || null,
        plan_grouping: mainRow['ProductGrouping'] || null,
        start_date: mainRow['InceptionDate'] ? XLSX.SSF.format('yyyy-mm-dd', mainRow['InceptionDate']) : null,
        phone: mainRow['Contact Number'] || null,
        email: mainRow['Email Address'] || null,
        address_line1: mainRow['Physical Address'] || null,
        broker_code: brokerCode,
        broker_id: brokerId,
      };

      if (dryRun) {
        results.members.push({
          memberNumber,
          data: memberData
        });
        console.log(`✓ ${memberNumber}: Would create main member - ${mainRow['Name1']} ${mainRow['Surname']}`);
        
        // Process dependants in dry run too
        const dependantRows = rows.filter(r => 
          r.row['DependantCode'] > 0 || 
          (r.row['DependantType'] !== 'MainMember' && r.row['DependantType'])
        );

        for (const depRow of dependantRows) {
          const dep = depRow.row;
          let dependantType = dep['DependantType'];
          
          // Convert "Spouse" to "Spouse/Partner"
          if (dependantType === 'Spouse') {
            dependantType = 'Spouse/Partner';
          }

          results.dependants.push({
            memberNumber,
            dependantCode: parseInt(dep['DependantCode']) || 1,
            name: `${dep['Name1']} ${dep['Surname']}`
          });
          console.log(`  ↳ Would add ${dependantType}: ${dep['Name1']} ${dep['Surname']}`);
        }
      } else {
        // Insert main member
        const { data: newMember, error: memberError } = await supabase
          .from('members')
          .insert(memberData)
          .select()
          .single();

        if (memberError) throw memberError;

        results.members.push({
          memberNumber,
          id: newMember.id,
          data: memberData
        });
        console.log(`✓ ${memberNumber}: Created main member - ${mainRow['Name1']} ${mainRow['Surname']}`);

        // Process dependants
        const dependantRows = rows.filter(r => 
          r.row['DependantCode'] > 0 || 
          (r.row['DependantType'] !== 'MainMember' && r.row['DependantType'])
        );

        for (const depRow of dependantRows) {
          const dep = depRow.row;
          let dependantType = dep['DependantType'];
          
          // Convert "Spouse" to "Spouse/Partner"
          if (dependantType === 'Spouse') {
            dependantType = 'Spouse/Partner';
          }

          const dependantData = {
            member_id: newMember.id,
            member_number: memberNumber,
            dependant_code: parseInt(dep['DependantCode']) || 1,
            dependant_type: dependantType,
            first_name: dep['Name1'],
            last_name: dep['Surname'],
            date_of_birth: dep['DateOfBirth'] ? XLSX.SSF.format('yyyy-mm-dd', dep['DateOfBirth']) : null,
            id_number: dep['ID Number'] || null,
            status: mainMemberStatus, // Always use main member's status
          };

          const { error: depError } = await supabase
            .from('member_dependants')
            .insert(dependantData);

          if (depError) throw depError;

          results.dependants.push({
            memberNumber,
            dependantCode: dependantData.dependant_code,
            name: `${dep['Name1']} ${dep['Surname']}`
          });
          console.log(`  ↳ Added ${dependantType}: ${dep['Name1']} ${dep['Surname']}`);
        }
      }

    } catch (error) {
      results.errors.push({
        memberNumber,
        error: error.message,
        rows: rows.length
      });
      console.log(`❌ ${memberNumber}: ERROR - ${error.message}`);
    }
  }

  // Print summary
  console.log('\n=== IMPORT SUMMARY ===');
  console.log(`${dryRun ? 'Would create' : 'Created'} ${results.members.length} main members`);
  console.log(`${dryRun ? 'Would create' : 'Created'} ${results.dependants.length} dependants`);
  console.log(`Errors: ${results.errors.length}`);
  console.log(`Skipped: ${results.skipped.length}`);

  if (results.errors.length > 0) {
    console.log('\n=== ERRORS ===');
    results.errors.forEach(err => {
      console.log(`${err.memberNumber}: ${err.error}`);
    });
  }

  if (results.skipped.length > 0) {
    console.log('\n=== SKIPPED ===');
    results.skipped.forEach(skip => {
      console.log(`${skip.memberNumber}: ${skip.reason} (${skip.rows} rows)`);
    });
  }

  return results;
}

// Usage
const args = process.argv.slice(2);
const filePath = args[0] || 'src/app/members/members_fed.xlsx';
const startRow = parseInt(args[1]) || 2;
const endRow = args[2] ? parseInt(args[2]) : null;
const dryRun = args[3] === '--dry-run';

console.log('=== MEMBER + DEPENDANTS IMPORT ===');
console.log(`File: ${filePath}`);
console.log(`Start row: ${startRow}`);
console.log(`End row: ${endRow || 'all'}`);
console.log(`Dry run: ${dryRun}\n`);

importMembersWithDependants(filePath, startRow, endRow, dryRun)
  .then(() => {
    console.log('\n✅ Import completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });
