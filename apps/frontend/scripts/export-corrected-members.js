const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function exportCorrectedMembers() {
  console.log('📊 Exporting corrected member data...\n');

  // Fetch ALL members with broker info - no limit
  let allMembers = [];
  let from = 0;
  const batchSize = 1000;
  
  while (true) {
    const { data: batch, error } = await supabase
      .from('members')
      .select('*, brokers(code, name)')
      .order('member_number')
      .range(from, from + batchSize - 1);

    if (error) {
      console.error('Error:', error);
      return;
    }

    if (!batch || batch.length === 0) break;
    
    allMembers = allMembers.concat(batch);
    console.log(`Fetched ${allMembers.length} members...`);
    
    if (batch.length < batchSize) break;
    from += batchSize;
  }

  console.log(`\nTotal: ${allMembers.length} members\n`);

  // Transform to Excel format
  const excelData = allMembers.map(m => ({
    'broker name': m.brokers?.name || '',
    'Member Number': m.member_number,
    'first names': m.first_name,
    'last name': m.last_name,
    'Email': m.email || '',
    'Phone number': m.mobile || '',
    'plan name': m.plan_name || '',
    'Status': m.status,
    'Payment Method': m.payment_method || ''
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create summary sheet
  const summary = [
    ['Total Members', allMembers.length],
    ['Active', allMembers.filter(m => m.status === 'active').length],
    ['Pending', allMembers.filter(m => m.status === 'pending').length],
    ['Suspended', allMembers.filter(m => m.status === 'suspended').length],
    ['In Waiting', allMembers.filter(m => m.status === 'in_waiting').length],
    [''],
    ['With Plans', allMembers.filter(m => m.plan_name).length],
    ['Without Plans', allMembers.filter(m => !m.plan_name).length],
    [''],
    ['Export Date', new Date().toISOString()],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Create main data sheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Write file
  const filename = 'docs/all members list - CORRECTED.xlsx';
  XLSX.writeFile(wb, filename);

  console.log(`✅ Exported to: ${filename}`);
  console.log(`\nStats:`);
  console.log(`  Total: ${allMembers.length}`);
  console.log(`  Active: ${allMembers.filter(m => m.status === 'active').length}`);
  console.log(`  With Plans: ${allMembers.filter(m => m.plan_name).length}`);
  console.log(`  Without Plans: ${allMembers.filter(m => !m.plan_name).length}`);
}

exportCorrectedMembers().catch(console.error);
