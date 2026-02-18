/**
 * Verify Debit Order Test Data
 * Run: node verify-debit-order-test-data.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function verifyTestData() {
  console.log('🔍 Verifying Debit Order Test Data...\n');
  
  try {
    // Get all members with debit order data
    const response = await fetch(`${SUPABASE_URL}/rest/v1/members?select=broker_group,member_number,first_name,last_name,bank_name,monthly_premium,debit_order_day,debit_order_status,payment_status,failed_debit_count,total_arrears,netcash_account_reference,last_payment_date,next_debit_date&limit=1000`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const members = await response.json();
    
    // Group by broker
    const byBroker = {};
    const byStatus = {
      active: 0,
      failed: 0,
      suspended: 0,
      pending: 0
    };
    const byBank = {};
    
    members.forEach(m => {
      // Count by broker
      if (!byBroker[m.broker_group]) {
        byBroker[m.broker_group] = 0;
      }
      byBroker[m.broker_group]++;
      
      // Count by status
      if (m.debit_order_status) {
        byStatus[m.debit_order_status] = (byStatus[m.debit_order_status] || 0) + 1;
      }
      
      // Count by bank
      if (m.bank_name) {
        byBank[m.bank_name] = (byBank[m.bank_name] || 0) + 1;
      }
    });
    
    console.log('📊 MEMBERS BY BROKER GROUP\n');
    Object.keys(byBroker).sort().forEach(broker => {
      console.log(`${broker.padEnd(8)} : ${byBroker[broker]} members`);
    });
    
    console.log('\n\n📊 DEBIT ORDER STATUS BREAKDOWN\n');
    Object.keys(byStatus).forEach(status => {
      console.log(`${status.padEnd(12)} : ${byStatus[status]} members`);
    });
    
    console.log('\n\n📊 BANK DISTRIBUTION\n');
    Object.keys(byBank).sort().forEach(bank => {
      console.log(`${bank.padEnd(20)} : ${byBank[bank]} members`);
    });
    
    // Sample members from each scenario
    console.log('\n\n📋 SAMPLE MEMBERS BY SCENARIO\n');
    
    const active = members.filter(m => m.debit_order_status === 'active' && m.failed_debit_count === 0)[0];
    if (active) {
      console.log('✅ ACTIVE (Successful):');
      console.log(`   ${active.first_name} ${active.last_name} (${active.member_number})`);
      console.log(`   Bank: ${active.bank_name} | Premium: R${active.monthly_premium}`);
      console.log(`   Last Payment: ${active.last_payment_date} | Next Debit: ${active.next_debit_date}`);
      console.log(`   Arrears: R${active.total_arrears} | Failed Count: ${active.failed_debit_count}\n`);
    }
    
    const failed = members.filter(m => m.debit_order_status === 'failed')[0];
    if (failed) {
      console.log('❌ FAILED (Insufficient Funds):');
      console.log(`   ${failed.first_name} ${failed.last_name} (${failed.member_number})`);
      console.log(`   Bank: ${failed.bank_name} | Premium: R${failed.monthly_premium}`);
      console.log(`   Last Payment: ${failed.last_payment_date} | Next Debit: ${failed.next_debit_date}`);
      console.log(`   Arrears: R${failed.total_arrears} | Failed Count: ${failed.failed_debit_count}\n`);
    }
    
    const suspended = members.filter(m => m.debit_order_status === 'suspended')[0];
    if (suspended) {
      console.log('⏸️  SUSPENDED (Too Many Failures):');
      console.log(`   ${suspended.first_name} ${suspended.last_name} (${suspended.member_number})`);
      console.log(`   Bank: ${suspended.bank_name} | Premium: R${suspended.monthly_premium}`);
      console.log(`   Last Payment: ${suspended.last_payment_date} | Next Debit: ${suspended.next_debit_date}`);
      console.log(`   Arrears: R${suspended.total_arrears} | Failed Count: ${suspended.failed_debit_count}\n`);
    }
    
    const pending = members.filter(m => m.debit_order_status === 'pending' && !m.last_payment_date)[0];
    if (pending) {
      console.log('⏳ PENDING (First Debit):');
      console.log(`   ${pending.first_name} ${pending.last_name} (${pending.member_number})`);
      console.log(`   Bank: ${pending.bank_name} | Premium: R${pending.monthly_premium}`);
      console.log(`   Last Payment: ${pending.last_payment_date} | Next Debit: ${pending.next_debit_date}`);
      console.log(`   Arrears: R${pending.total_arrears} | Failed Count: ${pending.failed_debit_count}\n`);
    }
    
    const arrears = members.filter(m => m.total_arrears > 0 && m.debit_order_status === 'active')[0];
    if (arrears) {
      console.log('💰 ARREARS (Missed Payments):');
      console.log(`   ${arrears.first_name} ${arrears.last_name} (${arrears.member_number})`);
      console.log(`   Bank: ${arrears.bank_name} | Premium: R${arrears.monthly_premium}`);
      console.log(`   Last Payment: ${arrears.last_payment_date} | Next Debit: ${arrears.next_debit_date}`);
      console.log(`   Arrears: R${arrears.total_arrears} | Failed Count: ${arrears.failed_debit_count}\n`);
    }
    
    // Calculate totals
    const totalPremiums = members.reduce((sum, m) => sum + (m.monthly_premium || 0), 0);
    const totalArrears = members.reduce((sum, m) => sum + (m.total_arrears || 0), 0);
    const activeCount = members.filter(m => m.debit_order_status === 'active').length;
    
    console.log('\n📊 FINANCIAL SUMMARY\n');
    console.log(`Total Members: ${members.length}`);
    console.log(`Active Debit Orders: ${activeCount}`);
    console.log(`Monthly Premium Income: R${totalPremiums.toFixed(2)}`);
    console.log(`Total Arrears: R${totalArrears.toFixed(2)}`);
    console.log(`Average Premium: R${(totalPremiums / members.length).toFixed(2)}`);
    
    console.log('\n✅ Verification Complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyTestData();
