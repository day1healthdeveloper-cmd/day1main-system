const XLSX = require('xlsx');

const filePath = 'src/app/members/member_feb_corrected.xlsx';

const workbook = XLSX.readFile(filePath);
const data = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1'], { defval: '' });

const families = {};
data.forEach((row, idx) => {
  const memberNumber = row['MemberNumber'];
  
  if (!families[memberNumber]) {
    families[memberNumber] = [];
  }
  
  families[memberNumber].push({
    rowIndex: idx + 2,
    memberNumber,
    currentDependantCode: parseInt(row['DependantCode']) || 0,
    dependantType: row['DependantType'],
    firstName: row['Name1'],
    lastName: row['Surname'],
    dateOfBirth: row['DateOfBirth'] ? XLSX.SSF.format('yyyy-mm-dd', row['DateOfBirth']) : 'N/A',
  });
});

console.log('Finding remaining issues...\n');

const problemFamilies = [];

Object.keys(families).forEach(memberNumber => {
  const family = families[memberNumber];
  
  family.sort((a, b) => a.currentDependantCode - b.currentDependantCode);
  
  let hasIssue = false;
  const issues = [];
  
  family.forEach((member, idx) => {
    const currentCode = member.currentDependantCode;
    let expectedCode = 0;
    
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
    problemFamilies.push({
      memberNumber,
      family,
      issues
    });
  }
});

console.log(`Found ${problemFamilies.length} families with issues:\n`);

problemFamilies.forEach(({ memberNumber, family, issues }) => {
  console.log(`🏠 Policy: ${memberNumber}`);
  console.log('-'.repeat(100));
  
  family.forEach(member => {
    const issue = issues.find(i => i.member === member);
    if (issue) {
      console.log(`  ❌ [Current: ${issue.currentCode} | Expected: ${issue.expectedCode}] ${member.dependantType}: ${member.firstName} ${member.lastName}`);
      console.log(`     DOB: ${member.dateOfBirth} | Row: ${member.rowIndex}`);
    } else {
      console.log(`  ✓ [Code: ${member.currentDependantCode}] ${member.dependantType}: ${member.firstName} ${member.lastName}`);
    }
  });
  console.log('');
});
