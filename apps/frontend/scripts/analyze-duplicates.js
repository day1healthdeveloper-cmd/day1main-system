const XLSX = require('xlsx');

const filePath = 'src/app/members/member_feb.xlsx';

console.log('📖 Reading Excel file...\n');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

console.log(`Total rows in Excel: ${data.length}\n`);

// Group by member_number + dependant_code
const groups = {};
data.forEach((row, idx) => {
  const memberNumber = row['MemberNumber'];
  const dependantCode = parseInt(row['DependantCode']) || 0;
  const key = `${memberNumber}-${dependantCode}`;
  
  if (!groups[key]) {
    groups[key] = [];
  }
  
  groups[key].push({
    rowIndex: idx + 2, // +2 because Excel is 1-indexed and has header
    memberNumber,
    dependantCode,
    firstName: row['Name1'],
    lastName: row['Surname'],
    dateOfBirth: row['DateOfBirth'] ? XLSX.SSF.format('yyyy-mm-dd', row['DateOfBirth']) : 'N/A',
    idNumber: row['ID Number'] || 'N/A',
    status: row['StatusDescription'],
  });
});

// Find duplicates (same member_number + dependant_code appearing multiple times)
const duplicates = Object.entries(groups).filter(([key, rows]) => rows.length > 1);

console.log(`Found ${duplicates.length} duplicate groups (same member_number + dependant_code)\n`);
console.log('='.repeat(100));

let totalDuplicateRows = 0;

duplicates.slice(0, 20).forEach(([key, rows]) => {
  console.log(`\n🔍 Key: ${key} (${rows.length} occurrences)`);
  console.log('-'.repeat(100));
  
  rows.forEach((row, idx) => {
    console.log(`  ${idx + 1}. Row ${row.rowIndex}: ${row.firstName} ${row.lastName}`);
    console.log(`     DOB: ${row.dateOfBirth} | ID: ${row.idNumber} | Status: ${row.status}`);
  });
  
  // Check if they're truly duplicates (same DOB and ID)
  const uniqueByDobAndId = new Set(rows.map(r => `${r.dateOfBirth}-${r.idNumber}`));
  if (uniqueByDobAndId.size > 1) {
    console.log(`     ⚠️  DIFFERENT people! (${uniqueByDobAndId.size} unique DOB+ID combinations)`);
  } else {
    console.log(`     ✓ Same person (duplicate)`);
  }
  
  totalDuplicateRows += (rows.length - 1); // Count extras beyond the first
});

if (duplicates.length > 20) {
  console.log(`\n... and ${duplicates.length - 20} more duplicate groups`);
}

console.log('\n' + '='.repeat(100));
console.log(`\nSummary:`);
console.log(`- Total rows: ${data.length}`);
console.log(`- Duplicate groups: ${duplicates.length}`);
console.log(`- Total duplicate rows (would be skipped): ${totalDuplicateRows}`);
console.log(`- Unique rows (would be imported): ${data.length - totalDuplicateRows}`);

// Count how many are truly different people
let differentPeople = 0;
duplicates.forEach(([key, rows]) => {
  const uniqueByDobAndId = new Set(rows.map(r => `${r.dateOfBirth}-${r.idNumber}`));
  if (uniqueByDobAndId.size > 1) {
    differentPeople += (rows.length - 1);
  }
});

console.log(`\n⚠️  WARNING: ${differentPeople} rows marked as duplicates are actually DIFFERENT people!`);
