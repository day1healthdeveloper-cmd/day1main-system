require('dotenv').config({ path: '.env.local' });
const XLSX = require('xlsx');

const filePath = '../../docs/all members list.xlsx';
const workbook = XLSX.readFile(filePath);
const data = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1']);

console.log('Rows 2022-2041 (20 members):\n');
const batch = data.slice(2020, 2040);
batch.forEach((row, i) => {
  const rowNum = 2022 + i;
  console.log(`${rowNum}: ${row['Member Number']} - ${row['first names']} ${row['last name']} - Broker: ${row['broker name']}`);
});

console.log(`\nTotal remaining: ${data.length - 2020} members (rows 2022-${data.length + 1})`);
