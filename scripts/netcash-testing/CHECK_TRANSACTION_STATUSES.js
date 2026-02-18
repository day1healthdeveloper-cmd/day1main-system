/**
 * Check transaction statuses directly from database
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NzI5NzcsImV4cCI6MjA1MjM0ODk3N30.Aq_Ks-Ov-Yx-Yx0Yx0Yx0Yx0Yx0Yx0Yx0Yx0Yx0Yx0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatuses() {
  console.log('📊 Checking transaction statuses from database...\n');
  
  const { data: transactions, error } = await supabase
    .from('debit_order_transactions')
    .select('id, member_number, status, rejection_reason, netcash_reference, processed_at')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`Total transactions: ${transactions.length}\n`);
  
  const statusCounts = {
    successful: 0,
    failed: 0,
    pending: 0,
    processing: 0,
    reversed: 0
  };
  
  transactions.forEach(txn => {
    statusCounts[txn.status]++;
  });
  
  console.log('Status breakdown:');
  console.log(`  ✅ Successful: ${statusCounts.successful}`);
  console.log(`  ❌ Failed: ${statusCounts.failed}`);
  console.log(`  ⏳ Pending: ${statusCounts.pending}`);
  console.log(`  🔄 Processing: ${statusCounts.processing}`);
  console.log(`  ↩️  Reversed: ${statusCounts.reversed}`);
  console.log('');
  
  console.log('Sample transactions:');
  transactions.slice(0, 10).forEach(txn => {
    const icon = txn.status === 'successful' ? '✅' : txn.status === 'failed' ? '❌' : '⏳';
    console.log(`  ${icon} ${txn.member_number}: ${txn.status}${txn.rejection_reason ? ` (${txn.rejection_reason})` : ''}`);
  });
}

checkStatuses();
