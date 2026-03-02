rt row: ${startRow}`);
console.log(`End row: ${endRow || 'end of file'}`);
console.log(`Dry run: ${dryRun}\n`);

importProviders(filePath, startRow, endRow, dryRun)
  .then(() => {
    console.log('\nImport completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
  });
}`);
  console.log(`Skipped: ${skippedCount}`);

  if (errors.length > 0) {
    console.log('\n=== ERRORS ===');
    errors.forEach(err => console.log(err));
  }
}

// Command line arguments
const args = process.argv.slice(2);
const filePath = args[0] || '../../docs/providers_rows.csv';
const startRow = parseInt(args[1]) || 2;
const endRow = args[2] ? parseInt(args[2]) : null;
const dryRun = args[3] === '--dry-run';

console.log('=== PROVIDER IMPORT SCRIPT ===');
console.log(`File: ${filePath}`);
console.log(`Stae {
          console.log(`Row ${excelRow}: SUCCESS - ${doctorSurname} (${providerNumber})`);
          successCount++;
        }
      }

    } catch (error) {
      console.log(`Row ${excelRow}: ERROR - ${error.message}`);
      errors.push(`Row ${excelRow}: ${error.message}`);
      errorCount++;
    }
  }

  // Summary
  console.log('\n=== IMPORT SUMMARY ===');
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Duplicates found: ${duplicateCount}`);
  console.log(`Errors: ${errorCount   if (dryRun) {
        console.log(`Row ${excelRow}: DRY RUN - Would import ${doctorSurname} (${profession})`);
        successCount++;
      } else {
        // Insert into database
        const { data: inserted, error } = await supabase
          .from('providers')
          .insert([providerData])
          .select();

        if (error) {
          console.log(`Row ${excelRow}: ERROR - ${error.message}`);
          errors.push(`Row ${excelRow}: ${error.message}`);
          errorCount++;
        } els? 'Dentist' : 'GP',
        profession: profession,
        region: region,
        suburb: suburb,
        address: address,
        doctor_surname: doctorSurname,
        prno: prno || null,
        tel: tel || null,
        phone: tel || null, // Duplicate for compatibility
        fax: fax || null,
        disp_province: dispProvince,
        is_active: isActive,
        status: isActive ? 'active' : 'inactive',
        email: null, // Not in Excel
        created_at: new Date().toISOString()
      };

   {
        console.log(`Row ${excelRow}: DUPLICATE - ${duplicateCheck.reason} (${doctorSurname})`);
        duplicateCount++;
        continue;
      }

      // Generate provider number
      const providerNumber = generateProviderNumber(profession, excelRow);

      // Prepare provider data
      const providerData = {
        provider_num: providerNumber,
        name: doctorSurname || `Provider ${excelRow}`,
        practice_name: `${doctorSurname} - ${suburb}`.trim(),
        type: profession === 'Dentist' e = row['DISP.PROVINCE'] || '';
      const isActive = row['is_active'] === 'TRUE' || row['is_active'] === true;
      const profession = row['profession'] || 'GP';

      // Skip if no essential data
      if (!doctorSurname && !address) {
        console.log(`Row ${excelRow}: SKIPPED - No doctor surname or address`);
        skippedCount++;
        continue;
      }

      // Check for duplicates
      const duplicateCheck = await checkDuplicate(prno, doctorSurname);
      if (duplicateCheck.isDuplicate) 
    const row = rowsToProcess[i];
    const excelRow = startRow + i;

    try {
      // Extract data from Excel
      const region = row['REGION'] || '';
      const suburb = row['SUBURB'] || '';
      const address = row['ADDRESS'] || '';
      const doctorSurname = row['DOCTOR SURNAME'] || '';
      const prno = row['PRNO'] ? String(row['PRNO']).trim() : '';
      const tel = row['TEL'] ? String(row['TEL']).trim() : '';
      const fax = row['FAX'] ? String(row['FAX']).trim() : '';
      const dispProvinc process
  const rowsToProcess = endRow 
    ? data.slice(startRow - 2, endRow - 1)
    : data.slice(startRow - 2);

  console.log(`Processing rows ${startRow} to ${endRow || data.length + 1}`);
  console.log(`Total rows to process: ${rowsToProcess.length}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (no database changes)' : 'LIVE IMPORT'}\n`);

  let successCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (let i = 0; i < rowsToProcess.length; i++) { function importProviders(filePath, startRow = 2, endRow = null, dryRun = false) {
  console.log('Reading Excel file...');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // First sheet
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  console.log(`Total rows in Excel: ${data.length}`);

  // Determine which rows to`${prefix}${String(index).padStart(6, '0')}`;
}

async'PROV';
  return        (byName && byName.length > 0) {
      return { isDuplicate: true, reason: 'name_match', existing: byName[0] };
    }
  }

  return { isDuplicate: false };
}

function generateProviderNumber(profession, index) {
  const prefix = profession === 'Dentist' ? 'DENT' : 
                 profession === 'GP' ? 'GP' : 
           {
    const { data: byPrno } = await supabase
      .from('providers')
      .select('id, provider_num, name, prno')
      .eq('prno', prno)
      .single();

    if (byPrno) {
      return { isDuplicate: true, reason: 'prno', existing: byPrno };
    }
  }

  // Check by doctor surname + address (to avoid duplicates)
  if (doctorSurname) {
    const { data: byName } = await supabase
      .from('providers')
      .select('id, provider_num, name, doctor_surname')
      .ilike('doctor_surname', doctorSurname);

    if-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Excel column mapping
const COLUMN_MAP = {
  'REGION': 'region',
  'SUBURB': 'suburb',
  'ADDRESS': 'address',
  'DOCTOR SURNAME': 'doctor_surname',
  'PRNO': 'prno',
  'TEL': 'tel',
  'FAX': 'fax',
  'DISP.PROVINCE': 'disp_province',
  'is_active': 'is_active',
  'profession': 'profession'
};

async function checkDuplicate(prno, doctorSurname) {
  // Check by practice number
  if (prno) require('dotenv').config({ path: '.env.local' });
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase