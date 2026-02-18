/**
 * Check Transactions in Database
 * This script connects directly to Supabase to check transaction data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTransactions() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 CHECKING TRANSACTION DATA');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // 1. Count total transactions
    const { count: totalCount, error: countError } = await supabase
      .from('debit_order_transactions')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    console.log(`✅ Total Transactions: ${totalCount || 0}\n`);

    // 2. Get transactions by status
    const { data: transactions, error: txError } = await supabase
      .from('debit_order_transactions')
      .select(`
        id,
        member_id,
        run_id,
        amount,
        status,
        retry_count,
        failure_reason,
        created_at,
        member:members(member_number, first_name, last_name, broker_group)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (txError) throw txError;

    // Group by status
    const byStatus = {};
    transactions.forEach(tx => {
      if (!byStatus[tx.status]) {
        byStatus[tx.status] = [];
      }
      byStatus[tx.status].push(tx);
    });

    console.log('📈 Transactions by Status:');
    Object.keys(byStatus).forEach(status => {
      console.log(`   ${status}: ${byStatus[status].length}`);
    });

    // 3. Show recent transactions
    console.log('\n📋 Recent Transactions (Last 10):');
    console.log('─────────────────────────────────────────────────────────');
    
    transactions.slice(0, 10).forEach((tx, index) => {
      console.log(`\n${index + 1}. Transaction ID: ${tx.id.substring(0, 8)}...`);
      console.log(`   Member: ${tx.member?.member_number || 'N/A'} - ${tx.member?.first_name || ''} ${tx.member?.last_name || ''}`);
      console.log(`   Amount: R${tx.amount?.toFixed(2) || '0.00'}`);
      console.log(`   Status: ${tx.status}`);
      console.log(`   Retry Count: ${tx.retry_count || 0}`);
      if (tx.failure_reason) {
        console.log(`   Failure Reason: ${tx.failure_reason}`);
      }
      console.log(`   Created: ${new Date(tx.created_at).toLocaleString()}`);
    });

    // 4. Get failed transactions
    const { data: failedTx, error: failedError } = await supabase
      .from('debit_order_transactions')
      .select('id, amount, retry_count, failure_reason, member:members(member_number, first_name, last_name)')
      .eq('status', 'failed')
      .limit(5);

    if (failedError) throw failedError;

    if (failedTx && failedTx.length > 0) {
      console.log('\n\n⚠️  Failed Transactions:');
      console.log('─────────────────────────────────────────────────────────');
      failedTx.forEach((tx, index) => {
        console.log(`\n${index + 1}. ID: ${tx.id.substring(0, 8)}...`);
        console.log(`   Member: ${tx.member?.member_number || 'N/A'}`);
        console.log(`   Amount: R${tx.amount?.toFixed(2)}`);
        console.log(`   Retry Count: ${tx.retry_count || 0}/3`);
        console.log(`   Reason: ${tx.failure_reason || 'Unknown'}`);
      });
    } else {
      console.log('\n\n✅ No failed transactions found');
    }

    // 5. Get statistics
    const { data: stats, error: statsError } = await supabase
      .from('debit_order_transactions')
      .select('status, amount');

    if (statsError) throw statsError;

    const statistics = {
      total: stats.length,
      totalAmount: 0,
      byStatus: {},
    };

    stats.forEach(tx => {
      statistics.totalAmount += tx.amount || 0;
      if (!statistics.byStatus[tx.status]) {
        statistics.byStatus[tx.status] = { count: 0, amount: 0 };
      }
      statistics.byStatus[tx.status].count++;
      statistics.byStatus[tx.status].amount += tx.amount || 0;
    });

    console.log('\n\n📊 Overall Statistics:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`Total Transactions: ${statistics.total}`);
    console.log(`Total Amount: R${statistics.totalAmount.toFixed(2)}`);
    console.log('\nBy Status:');
    Object.keys(statistics.byStatus).forEach(status => {
      const stat = statistics.byStatus[status];
      console.log(`  ${status}:`);
      console.log(`    Count: ${stat.count}`);
      console.log(`    Amount: R${stat.amount.toFixed(2)}`);
    });

    // 6. Check if we have any transactions to test with
    console.log('\n\n🧪 Test Data Availability:');
    console.log('─────────────────────────────────────────────────────────');
    
    const hasTransactions = transactions.length > 0;
    const hasFailedTransactions = failedTx && failedTx.length > 0;
    const hasSuccessfulTransactions = byStatus['successful']?.length > 0;
    
    console.log(`✅ Has Transactions: ${hasTransactions ? 'YES' : 'NO'}`);
    console.log(`${hasFailedTransactions ? '✅' : '⚠️ '} Has Failed Transactions: ${hasFailedTransactions ? 'YES' : 'NO'}`);
    console.log(`${hasSuccessfulTransactions ? '✅' : '⚠️ '} Has Successful Transactions: ${hasSuccessfulTransactions ? 'YES' : 'NO'}`);

    if (hasTransactions) {
      console.log('\n📝 Sample Transaction IDs for Testing:');
      if (transactions[0]) {
        console.log(`   Any Transaction: ${transactions[0].id}`);
      }
      if (failedTx && failedTx[0]) {
        console.log(`   Failed Transaction: ${failedTx[0].id}`);
      }
      if (byStatus['successful'] && byStatus['successful'][0]) {
        console.log(`   Successful Transaction: ${byStatus['successful'][0].id}`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ TRANSACTION CHECK COMPLETE');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  }
}

checkTransactions();
