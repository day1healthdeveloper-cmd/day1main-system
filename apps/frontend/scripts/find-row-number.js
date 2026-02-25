const XLSX = require('xlsx');

const filePath = '../../docs/all members list.xlsx';
const searchNumber = 'PAR10021208';

console.log(`Searching for member number: ${searchNumber}\n`);

const workbook = XLSX.readFile(filePath);
const sheetName = 'Sheet1';
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

for (let i = 0; i < data.length; i++) {
  const row = data[i];
  const memberNumber = row['Member Number'];
  
  if (memberNumber === searchNumber) {
    const excelRow = i + 2; // +2 because array is 0-indexed and Excel has header row
    console.log(`Found at Excel row: ${excelRow}`);
    console.log(`Member: ${row['first names']} ${row['last name']}`);
    console.log(`Broker: ${row['broker name']}`);
    console.log(`\nNext row to import: ${excelRow + 1}`);
    break;
  }
}
