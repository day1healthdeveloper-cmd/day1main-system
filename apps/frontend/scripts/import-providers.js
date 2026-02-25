require('dotenv').config({ path: '.env.local' });
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateProviderNumber(profession, index) {
  const prefix = profession === 'Dentist' ? 'DENT' : 
                 profession === 'GP' ? 'GP' : 
                 'PROV';
  return `${prefix}${String(index).padStart(6, '0')}`;
}

async function importProviders(filePath, startRow = 2, endRow = null) {
  console.log('Reading Excel file...');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  console.log(`Total rows: ${data.length}\n`);

  const rowsToProcess = endRow ? data.slice(startRow - 2, endRow - 1) : data.slice(startRow - 2);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < rowsToProcess.length; i++) {
    const row = rowsToProcess[i];
    const excelRow = startRow + i;

    try {
      const doctorSurname = row['DOCTOR SURNAME'] || '';
      const profession = row['profession'] || 'GP';
      
      if (!doctorSurname) {
        console.log(`Row ${excelRow}: SKIPPED - No doctor surname`);
        continue;
      }

      const providerData = {
        provider_number: generateProviderNumber(profession, excelRow),
        name: doctorSurname,
        practice_name: `${doctorSurname} - ${row['SUBURB'] || ''}`.trim(),
        type: profession === 'Dentist' ? 'Dentist' : 'GP',
        profession: profession,
        region: row['REGION'] || '',
        suburb: row['SUBURB'] || '',
        address: row['ADDRESS'] || '',
        doctor_surname: doctorSurname,
        prno: row['PRNO'] ? String(row['PRNO']).trim() : null,
        tel: row['TEL'] ? String(row['TEL']).trim() : null,
        phone: row['TEL'] ? String(row['TEL']).trim() : null,
        fax: row['FAX'] ? String(row['FAX']).trim() : null,
        disp_province: row['DISP.PROVINCE'] || '',
        is_active: row['is_active'] === 'TRUE' || row['is_active'] === true,
        status: (row['is_active'] === 'TRUE' || row['is_active'] === true) ? 'active' : 'inactive'
      };

      const { error } = await supabase
        .from('providers')
        .insert([providerData]);

      if (error) {
        console.log(`Row ${excelRow}: ERROR - ${error.message}`);
        errorCount++;
      } else {
        console.log(`Row ${excelRow}: SUCCESS - ${doctorSurname}`);
        successCount++;
      }

    } catch (error) {
      console.log(`Row ${excelRow}: ERROR - ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

const filePath = process.argv[2] || '../../docs/providers_rows.csv';
const startRow = parseInt(process.argv[3]) || 2;
const endRow = process.argv[4] ? parseInt(process.argv[4]) : null;

importProviders(filePath, startRow, endRow);
