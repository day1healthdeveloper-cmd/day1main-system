const XLSX = require('xlsx');

const filePath = 'src/app/members/member_feb.xlsx';

console.log('📖 Reading Excel file...\n');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

console.log(`Total rows in Excel: ${data.length}\n`);

// Check the specific member numbers that were previously duplicates
const checkMembers = [
  'DAY17021103', // BOITUMELO MAJADIBODU
  'DAY17026203', // IRVIN MATHEBULA
  'DAY17039495', // ALTA GROBLER
  'DAY17040423', // ZANDER MOGENTALE
  'DAY17041571', // AMEER ISMAIL
  'MAM1010431',  // SOOBRAMONEY REDDY
  'PAR10009853', // ADRIAAN VAN HEERDEN
  'PAR10011768', // BRADLEY VILJEE
  'PAR10020969', // WINNIE DE BRUYN
];

console.log('='.repeat(100));
console.log('CHECKING FAMILY GROUPS FOR PREVIOUSLY DUPLICATED MEMBERS');
console.log('='.repeat(100));

checkMembers.forEach(memberNumber => {
  const familyMembers = data.filter(row => row['MemberNumber'] === memberNumber);
  
  if (familyMembers.length === 0) {
    console.log(`\n❌ ${memberNumber}: NOT FOUND in updated file`);
    return;
  }
  
  console.log(`\n🏠 ${memberNumber}: ${familyMembers.length} family member(s)`);
  console.log('-'.repeat(100));
  
  // Sort by dependant code
  familyMembers.sort((a, b) => {
    const codeA = parseInt(a['DependantCode']) || 0;
    const codeB = parseInt(b['DependantCode']) || 0;
    return codeA - codeB;
  });
  
  familyMembers.forEach((member, idx) => {
    const dependantCode = parseInt(member['DependantCode']) || 0;
    const dependantType = member['DependantType'] || 'N/A';
    const firstName = member['Name1'];
    const lastName = member['Surname'];
    const dob = member['DateOfBirth'] ? XLSX.SSF.format('yyyy-mm-dd', member['DateOfBirth']) : 'N/A';
    const idNumber = member['ID Number'] || 'N/A';
    const status = member['StatusDescription'];
    
    let icon = '👤';
    if (dependantCode === 0) icon = '👨‍💼'; // Main member
    else if (dependantType === 'Spouse') icon = '💑'; // Spouse
    else if (dependantType.includes('Child')) icon = '👶'; // Child
    
    console.log(`  ${icon} [Code ${dependantCode}] ${dependantType}: ${firstName} ${lastName}`);
    console.log(`     DOB: ${dob} | ID: ${idNumber} | Status: ${status}`);
  });
});

console.log('\n' + '='.repeat(100));
console.log('\nSUMMARY:');
console.log(`- Total rows in file: ${data.length}`);
console.log(`- Previously duplicated members checked: ${checkMembers.length}`);
console.log(`- All duplicates should now be properly structured as family groups`);
