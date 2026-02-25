require('dotenv').config({ path: '.env.local' });
const XLSX = require('xlsx');

const filePath = '../../docs/all members list.xlsx';
const workbook = XLSX.readFile(filePath);
const data = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1']);

const remaining = data.slice(2020);
const brokerCounts = {};

remaining.forEach(row => {
  const broker = row['broker name'];
  brokerCounts[broker] = (brokerCounts[broker] || 0) + 1;
});

console.log('Brokers in remaining 91 members:\n');
Object.entries(brokerCounts).sort((a, b) => b[1] - a[1]).forEach(([broker, count]) => {
  console.log(`${broker}: ${count} members`);
});
