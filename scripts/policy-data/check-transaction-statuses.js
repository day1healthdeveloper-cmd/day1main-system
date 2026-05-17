/**
 * Check transaction statuses directly from Supabase
 * Run: node check-transaction-statuses.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_ANON_KEY) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY");

async function checkStatuses() {
  console.log('📊 Checking transaction statuses from Supabase...\n');
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/debit_order_transactions?select=id,member_number,status,rejection_reason,netcash_reference,processed_at&order=created_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const transactions = await response.json();
    
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
    
    console.log('Sample transactions (first 15):');
    transactions.slice(0, 15).forEach(txn => {
      const icon = txn.status === 'successful' ? '✅' : txn.status === 'failed' ? '❌' : '⏳';
      const reason = txn.rejection_reason ? ` (${txn.rejection_reason})` : '';
      const ref = txn.netcash_reference ? ` [${txn.netcash_reference}]` : '';
      console.log(`  ${icon} ${txn.member_number}: ${txn.status}${reason}${ref}`);
    });
    
    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStatuses();
