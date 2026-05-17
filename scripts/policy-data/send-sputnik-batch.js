/**
 * Send SPUTNIK Test Batch to Netcash
 * This creates a test batch we can track through all testing scenarios
 * Run: node supabase/send-sputnik-batch.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_ANON_KEY) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY");

async function sendSputnikBatch() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 SENDING SPUTNIK TEST BATCH');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // 1. Get test members for the batch
    console.log('1️⃣  Fetching test members...');
    const membersResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/members?select=id,member_number,first_name,last_name,id_number,bank_name,bank_account_number,bank_account_type,bank_branch_code,monthly_premium,broker_group&debit_order_status=eq.active&limit=5`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const members = await membersResponse.json();
    
    console.log('   Debug - members response:', members);
    
    if (!members || !Array.isArray(members) || members.length === 0) {
      console.log('   ❌ No active members found!');
      console.log('   Please ensure you have members with:');
      console.log('   - debit_order_status = "active"');
      console.log('   - Bank details filled in');
      console.log('   - Monthly premium set\n');
      return;
    }

    console.log(`   ✅ Found ${members.length} active members\n`);

    // 2. Create debit order run
    console.log('2️⃣  Creating SPUTNIK debit order run...');
    
    const runDate = new Date();
    const batchName = `SPUTNIK_${runDate.getFullYear()}${String(runDate.getMonth() + 1).padStart(2, '0')}${String(runDate.getDate()).padStart(2, '0')}_${String(runDate.getHours()).padStart(2, '0')}${String(runDate.getMinutes()).padStart(2, '0')}`;
    
    const totalAmount = members.reduce((sum, m) => sum + (m.monthly_premium || 0), 0);

    const runData = {
      batch_name: batchName,
      run_date: runDate.toISOString(),
      batch_type: 'monthly',
      status: 'pending',
      total_members: members.length,
      total_amount: totalAmount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const createRunResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/debit_order_runs`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(runData)
      }
    );

    if (!createRunResponse.ok) {
      const error = await createRunResponse.text();
      throw new Error(`Failed to create run: ${error}`);
    }

    const [run] = await createRunResponse.json();
    console.log(`   ✅ Created run: ${run.id}`);
    console.log(`   Batch Name: ${batchName}`);
    console.log(`   Members: ${members.length}`);
    console.log(`   Total Amount: R${totalAmount.toFixed(2)}\n`);

    // 3. Create transactions for each member
    console.log('3️⃣  Creating transactions...');
    
    const transactions = members.map(member => ({
      run_id: run.id,
      member_id: member.id,
      member_number: member.member_number,
      member_name: `${member.first_name} ${member.last_name}`,
      account_reference: member.member_number,
      amount: member.monthly_premium || 0,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const createTxResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/debit_order_transactions`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(transactions)
      }
    );

    if (!createTxResponse.ok) {
      const error = await createTxResponse.text();
      throw new Error(`Failed to create transactions: ${error}`);
    }

    const createdTransactions = await createTxResponse.json();
    console.log(`   ✅ Created ${createdTransactions.length} transactions\n`);

    // 4. Prepare Netcash batch data
    console.log('4️⃣  Preparing Netcash batch data...');
    
    const netcashBatch = {
      batchName: batchName,
      actionDate: runDate.toISOString().split('T')[0],
      serviceKey: process.env.NETCASH_SERVICE_KEY || '51498414802',
      transactions: members.map(member => ({
        accountReference: member.member_number,
        accountHolderName: `${member.first_name} ${member.last_name}`,
        accountNumber: member.bank_account_number,
        accountType: member.bank_account_type === 'savings' ? '1' : '2',
        branchCode: member.bank_branch_code,
        amount: (member.monthly_premium || 0) * 100, // Convert to cents
        idNumber: member.id_number,
        emailAddress: '',
        mobileNumber: ''
      }))
    };

    console.log(`   ✅ Prepared batch with ${netcashBatch.transactions.length} transactions\n`);

    // 5. Display batch summary
    console.log('5️⃣  SPUTNIK Batch Summary:');
    console.log('   ─────────────────────────────────────────────────────────');
    console.log(`   Run ID: ${run.id}`);
    console.log(`   Batch Name: ${batchName}`);
    console.log(`   Run Date: ${runDate.toLocaleString()}`);
    console.log(`   Total Members: ${members.length}`);
    console.log(`   Total Amount: R${totalAmount.toFixed(2)}`);
    console.log('\n   Members in batch:');
    members.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.member_number} - ${member.first_name} ${member.last_name}`);
      console.log(`      Amount: R${member.monthly_premium?.toFixed(2) || '0.00'}`);
      console.log(`      Bank: ${member.bank_name || 'N/A'}`);
      console.log(`      Account: ${member.bank_account_number || 'N/A'}`);
    });

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ SPUTNIK BATCH CREATED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════\n');

    // 6. Next steps
    console.log('📋 NEXT STEPS:');
    console.log('─────────────────────────────────────────────────────────');
    console.log('1. Submit to Netcash:');
    console.log('   - Go to: http://localhost:3001/operations/debit-orders');
    console.log('   - Find the SPUTNIK batch in the list');
    console.log('   - Click "Submit to Netcash"');
    console.log('   - Authorize in Netcash portal\n');
    
    console.log('2. Track the batch:');
    console.log(`   - Run ID: ${run.id}`);
    console.log(`   - Batch Name: ${batchName}`);
    console.log('   - Use this to filter in UI\n');
    
    console.log('3. Test scenarios:');
    console.log('   - View transactions');
    console.log('   - Check transaction status');
    console.log('   - Test failed payment handling');
    console.log('   - Test refunds');
    console.log('   - Test reconciliation\n');

    console.log('4. Verify in database:');
    console.log('   Run: node supabase/check-sputnik-batch.js\n');

    // Save batch info for later reference
    const batchInfo = {
      runId: run.id,
      batchName: batchName,
      createdAt: new Date().toISOString(),
      totalMembers: members.length,
      totalAmount: totalAmount,
      members: members.map(m => ({
        id: m.id,
        memberNumber: m.member_number,
        name: `${m.first_name} ${m.last_name}`,
        amount: m.monthly_premium
      })),
      transactions: createdTransactions.map(t => t.id)
    };

    console.log('💾 Batch info saved for reference:');
    console.log(JSON.stringify(batchInfo, null, 2));
    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:', error);
  }
}

sendSputnikBatch();
