const XLSX = require('xlsx');

const filePath = process.argv[2] || 'docs/all members list.xlsx';
console.log('📖 Reading Excel file...\n');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

console.log('Column names in Excel:');
if (data.length > 0) {
  Object.keys(data[0]).forEach((col, index) => {
    console.log(`  ${index + 1}. "${col}"`);
  });
  
  console.log('\n\nFirst row sample:');
  console.log(JSON.stringify(data[0], null, 2));
}
