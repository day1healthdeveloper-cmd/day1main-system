const XLSX = require('xlsx');

const filePath = 'src/app/members/member_feb.xlsx';

console.log('📖 Reading Excel file...\n');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

console.log(`Total rows in Excel: ${data.length}\n`);

// Group by MemberNumber (Policy Number)
const families = {};
data.forEach((row, idx) => {
  const memberNumber = row['MemberNumber'];
  
  if (!families[memberNumber]) {
    families[memberNumber] = [];
  }
  
  families[memberNumber].push({
    rowIndex: idx + 2, // Excel row (1-indexed + header)
    memberNumber,
    currentDependantCode: row['DependantCode'],
    dependantType: row['DependantType'],
    firstName: row['Name1'],
    lastName: row['Surname'],
    dateOfBirth: row['DateOfBirth'] ? XLSX.SSF.format('yyyy-mm-dd', row['DateOfBirth']) : 'N/A',
    idNumber: row['ID Number'] || 'N/A',
    status: row['StatusDescription'],
  });
});

console.log('='.repeat(100));
console.log('ANALYZING FAMILY STRUCTURES');
console.log('='.repeat(100));

// Analyze first 10 families to show current structure
const familyKeys = Object.keys(families).slice(0, 10);
let issuesFound = 0;
let correctFamilies = 0;

familyKeys.forEach(memberNumber => {
  const family = families[memberNumber];
  
  console.log(`\n🏠 Policy: ${memberNumber} (${family.length} members)`);
  console.log('-'.repeat(100));
  
  // Sort by current dependant code
  family.sort((a, b) => {
    const codeA = parseInt(a.currentDependantCode) || 0;
    const codeB = parseInt(b.currentDependantCode) || 0;
    return codeA - codeB;
  });
  
  let hasIssue = false;
  
  family.forEach((member, idx) => {
    const currentCode = parseInt(member.currentDependantCode) || 0;
    let expectedCode = 0;
    let icon = '❓';
    
    // Determine expected code based on type
    if (member.dependantType === 'MainMember') {
      expectedCode = 0;
      icon = '👨‍💼';
    } else if (member.dependantType === 'Spouse' || member.dependantType === 'Spouse/Partner') {
      // Spouses should be 1, 2, etc (after main member)
      const spouseIndex = family.filter((m, i) => 
        i < idx && (m.dependantType === 'Spouse' || m.dependantType === 'Spouse/Partner')
      ).length;
      expectedCode = spouseIndex + 1;
      icon = '💑';
    } else if (member.dependantType === 'Child') {
      // Children come after spouses
      const numSpouses = family.filter(m => 
        m.dependantType === 'Spouse' || m.dependantType === 'Spouse/Partner'
      ).length;
      const childIndex = family.filter((m, i) => 
        i < idx && m.dependantType === 'Child'
      ).length;
      expectedCode = numSpouses + childIndex + 1;
      icon = '👶';
    }
    
    const codeMatch = currentCode === expectedCode ? '✓' : '✗';
    if (currentCode !== expectedCode) {
      hasIssue = true;
    }
    
    console.log(`  ${icon} [Current: ${currentCode} | Expected: ${expectedCode}] ${codeMatch} ${member.dependantType}: ${member.firstName} ${member.lastName}`);
    console.log(`     DOB: ${member.dateOfBirth} | Row: ${member.rowIndex}`);
  });
  
  if (hasIssue) {
    issuesFound++;
    console.log(`  ⚠️  NEEDS CORRECTION`);
  } else {
    correctFamilies++;
    console.log(`  ✅ CORRECT`);
  }
});

console.log('\n' + '='.repeat(100));
console.log('\nPROPOSED LOGIC:');
console.log('1. Main Member (DependantType = "MainMember") → DependantCode = 0');
console.log('2. Spouses (DependantType = "Spouse") → DependantCode = 1, 2, 3... (in order of appearance)');
console.log('3. Children (DependantType = "Child") → DependantCode = (num_spouses + 1), (num_spouses + 2)...');
console.log('   - Children ordered by Date of Birth (oldest first)');
console.log('\n' + '='.repeat(100));

console.log(`\nSAMPLE ANALYSIS (first 10 families):`);
console.log(`- Total families checked: ${familyKeys.length}`);
console.log(`- Families with correct codes: ${correctFamilies}`);
console.log(`- Families needing correction: ${issuesFound}`);
console.log(`\nTotal families in file: ${Object.keys(families).length}`);
