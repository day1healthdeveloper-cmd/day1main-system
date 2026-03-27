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
    rowIndex: idx + 2,
    memberNumber,
    currentDependantCode: row['DependantCode'],
    dependantType: row['DependantType'],
    firstName: row['Name1'],
    lastName: row['Surname'],
    dateOfBirth: row['DateOfBirth'] ? XLSX.SSF.format('yyyy-mm-dd', row['DateOfBirth']) : 'N/A',
  });
});

console.log('Checking ALL families for dependant code issues...\n');

let issuesFound = 0;
let correctFamilies = 0;
const problemFamilies = [];

Object.keys(families).forEach(memberNumber => {
  const family = families[memberNumber];
  
  // Sort by current dependant code
  family.sort((a, b) => {
    const codeA = parseInt(a.currentDependantCode) || 0;
    const codeB = parseInt(b.currentDependantCode) || 0;
    return codeA - codeB;
  });
  
  let hasIssue = false;
  const issues = [];
  
  family.forEach((member, idx) => {
    const currentCode = parseInt(member.currentDependantCode) || 0;
    let expectedCode = 0;
    
    // Determine expected code based on type
    if (member.dependantType === 'MainMember') {
      expectedCode = 0;
    } else if (member.dependantType === 'Spouse' || member.dependantType === 'Spouse/Partner') {
      const spouseIndex = family.filter((m, i) => 
        i < idx && (m.dependantType === 'Spouse' || m.dependantType === 'Spouse/Partner')
      ).length;
      expectedCode = spouseIndex + 1;
    } else if (member.dependantType === 'Child') {
      const numSpouses = family.filter(m => 
        m.dependantType === 'Spouse' || m.dependantType === 'Spouse/Partner'
      ).length;
      const childIndex = family.filter((m, i) => 
        i < idx && m.dependantType === 'Child'
      ).length;
      expectedCode = numSpouses + childIndex + 1;
    }
    
    if (currentCode !== expectedCode) {
      hasIssue = true;
      issues.push({
        member,
        currentCode,
        expectedCode
      });
    }
  });
  
  if (hasIssue) {
    issuesFound++;
    problemFamilies.push({
      memberNumber,
      family,
      issues
    });
  } else {
    correctFamilies++;
  }
});

console.log('='.repeat(100));
console.log('SUMMARY');
console.log('='.repeat(100));
console.log(`Total families: ${Object.keys(families).length}`);
console.log(`Families with CORRECT codes: ${correctFamilies}`);
console.log(`Families with ISSUES: ${issuesFound}`);

if (issuesFound > 0) {
  console.log('\n' + '='.repeat(100));
  console.log('FAMILIES WITH ISSUES (showing first 20):');
  console.log('='.repeat(100));
  
  problemFamilies.slice(0, 20).forEach(({ memberNumber, family, issues }) => {
    console.log(`\n🏠 Policy: ${memberNumber}`);
    console.log('-'.repeat(100));
    
    family.forEach(member => {
      const issue = issues.find(i => i.member === member);
      if (issue) {
        console.log(`  ❌ [Current: ${issue.currentCode} | Expected: ${issue.expectedCode}] ${member.dependantType}: ${member.firstName} ${member.lastName}`);
        console.log(`     DOB: ${member.dateOfBirth} | Row: ${member.rowIndex}`);
      } else {
        const code = parseInt(member.currentDependantCode) || 0;
        console.log(`  ✓ [Code: ${code}] ${member.dependantType}: ${member.firstName} ${member.lastName}`);
      }
    });
  });
  
  if (problemFamilies.length > 20) {
    console.log(`\n... and ${problemFamilies.length - 20} more families with issues`);
  }
} else {
  console.log('\n✅ ALL FAMILIES HAVE CORRECT DEPENDANT CODES!');
  console.log('No changes needed.');
}
