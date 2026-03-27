const XLSX = require('xlsx');

const filePath = 'src/app/members/member_feb.xlsx';
const outputPath = 'src/app/members/member_feb_fixed.xlsx';

console.log('📖 Reading Excel file...\n');
const workbook = XLSX.readFile(filePath, { cellStyles: true, cellNF: true, cellDates: false });
const sheet = workbook.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

console.log(`Total rows in Excel: ${data.length}\n`);

// Group by MemberNumber (Policy Number)
const families = {};
data.forEach((row, idx) => {
  const memberNumber = row['MemberNumber'];
  
  if (!families[memberNumber]) {
    families[memberNumber] = [];
  }
  
  families[memberNumber].push({
    originalIndex: idx,
    row: row
  });
});

console.log('🔧 Fixing dependant codes...\n');

let fixedCount = 0;
let unchangedCount = 0;

Object.keys(families).forEach(memberNumber => {
  const family = families[memberNumber];
  
  // Separate by type
  const mainMembers = family.filter(f => f.row['DependantType'] === 'MainMember');
  const spouses = family.filter(f => 
    f.row['DependantType'] === 'Spouse' || 
    f.row['DependantType'] === 'Spouse/Partner' || 
    f.row['DependantType'] === 'Adult'
  );
  const children = family.filter(f => f.row['DependantType'] === 'Child');
  
  // Sort children by date of birth (oldest first)
  children.sort((a, b) => {
    const dobA = a.row['DateOfBirth'] || 0;
    const dobB = b.row['DateOfBirth'] || 0;
    return dobA - dobB; // Earlier dates (smaller numbers) come first
  });
  
  // Assign new dependant codes
  let codeChanged = false;
  
  // Main member = 0
  mainMembers.forEach(member => {
    const oldCode = member.row['DependantCode'];
    member.row['DependantCode'] = 0;
    if (oldCode !== 0) {
      codeChanged = true;
    }
  });
  
  // Spouses = 1, 2, 3...
  spouses.forEach((member, idx) => {
    const oldCode = member.row['DependantCode'];
    const newCode = idx + 1;
    member.row['DependantCode'] = newCode;
    if (oldCode !== newCode) {
      codeChanged = true;
    }
  });
  
  // Children = (num_spouses + 1), (num_spouses + 2)...
  children.forEach((member, idx) => {
    const oldCode = member.row['DependantCode'];
    const newCode = spouses.length + idx + 1;
    member.row['DependantCode'] = newCode;
    if (oldCode !== newCode) {
      codeChanged = true;
    }
  });
  
  if (codeChanged) {
    fixedCount++;
  } else {
    unchangedCount++;
  }
});

console.log(`✅ Fixed ${fixedCount} families`);
console.log(`✓ ${unchangedCount} families already correct`);

// Update only the DependantCode column in the original sheet
console.log('\n📝 Updating DependantCode column in original sheet...');

// Find the DependantCode column
const range = XLSX.utils.decode_range(sheet['!ref']);
let dependantCodeCol = -1;

// Find column header
for (let C = range.s.c; C <= range.e.c; ++C) {
  const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
  const cell = sheet[cellAddress];
  if (cell && cell.v === 'DependantCode') {
    dependantCodeCol = C;
    break;
  }
}

if (dependantCodeCol === -1) {
  console.error('❌ Could not find DependantCode column!');
  process.exit(1);
}

// Update only the DependantCode cells
data.forEach((row, idx) => {
  const memberNumber = row['MemberNumber'];
  const family = families[memberNumber];
  const member = family.find(f => f.originalIndex === idx);
  
  const rowNum = idx + 1; // +1 for header row
  const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: dependantCodeCol });
  
  // Update the cell value
  if (!sheet[cellAddress]) {
    sheet[cellAddress] = {};
  }
  sheet[cellAddress].v = member.row['DependantCode'];
  sheet[cellAddress].t = 'n'; // number type
});

// Create new workbook with the modified sheet (preserving all formatting)
const newWorkbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWorkbook, sheet, 'Sheet1');

// Write to file with all formatting preserved
XLSX.writeFile(newWorkbook, outputPath, { cellStyles: true });

console.log(`\n✅ Corrected file saved to: ${outputPath}`);
console.log('\n' + '='.repeat(100));
console.log('SUMMARY:');
console.log('='.repeat(100));
console.log(`Total families: ${Object.keys(families).length}`);
console.log(`Families corrected: ${fixedCount}`);
console.log(`Families unchanged: ${unchangedCount}`);
console.log(`Total rows: ${data.length}`);
console.log('\nLogic applied:');
console.log('  1. Main Member → DependantCode = 0');
console.log('  2. Spouses → DependantCode = 1, 2, 3...');
console.log('  3. Children → DependantCode = (num_spouses + 1), (num_spouses + 2)...');
console.log('     - Children ordered by Date of Birth (oldest first)');
