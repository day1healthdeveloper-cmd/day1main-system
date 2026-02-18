/**
 * Setup Complete Debit Order Test Data
 * 10 members per broker group with realistic test scenarios
 * Run: node setup-debit-order-test-data.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

// 19 Broker Groups
const BROKER_GROUPS = [
  'DAY1', 'D1PAR', 'D1MAM', 'D1ACU', 'D1AIB', 'D1ARC', 'D1AXS', 
  'D1BOU', 'D1BPO', 'D1CSS', 'D1MED', 'D1MEM', 'D1MKT', 'D1MTS', 
  'D1NAV', 'D1RCO', 'D1TFG', 'D1THR', 'D1TLD'
];

// SA Banks
const BANKS = [
  { name: 'Standard Bank', branch: '051001' },
  { name: 'FNB', branch: '250655' },
  { name: 'ABSA', branch: '632005' },
  { name: 'Nedbank', branch: '198765' },
  { name: 'Capitec', branch: '470010' }
];

// Premium amounts (realistic Day1Health pricing)
const PREMIUMS = [325, 420, 565, 640, 665, 855, 918.75, 1131, 1369, 1598, 1724, 1750, 1924, 2262];

// Debit days
const DEBIT_DAYS = [2, 10, 15, 20, 26, 27];

// SA First Names
const FIRST_NAMES = [
  'Thabo', 'Sipho', 'Lerato', 'Nomsa', 'Mandla', 'Zanele', 'Bongani', 'Precious',
  'John', 'Sarah', 'Michael', 'Linda', 'David', 'Mary', 'Peter', 'Elizabeth',
  'Pieter', 'Annelie', 'Johan', 'Marietjie', 'Hendrik', 'Susanna', 'Willem', 'Elsa'
];

// SA Surnames
const SURNAMES = [
  'Nkosi', 'Dlamini', 'Mthembu', 'Khumalo', 'Ndlovu', 'Zulu', 'Sithole', 'Mokoena',
  'Smith', 'Jones', 'Brown', 'Williams', 'Johnson', 'Davis', 'Miller', 'Wilson',
  'Van der Merwe', 'Botha', 'Pretorius', 'Du Plessis', 'Van Wyk', 'Venter', 'Nel', 'Fourie'
];

// Generate realistic SA ID number
function generateIdNumber() {
  const year = 70 + Math.floor(Math.random() * 35); // 1970-2005
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  const gender = Math.floor(Math.random() * 10000);
  const citizenship = '0';
  const checksum = Math.floor(Math.random() * 10);
  
  return `${year}${month}${day}${String(gender).padStart(4, '0')}${citizenship}8${checksum}`;
}

// Generate account number
function generateAccountNumber() {
  return String(Math.floor(Math.random() * 900000000) + 100000000);
}

// Generate test member data
function generateTestMember(brokerGroup, index) {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const bank = BANKS[Math.floor(Math.random() * BANKS.length)];
  const premium = PREMIUMS[Math.floor(Math.random() * PREMIUMS.length)];
  const debitDay = DEBIT_DAYS[Math.floor(Math.random() * DEBIT_DAYS.length)];
  
  // Test scenarios based on index
  let scenario;
  if (index < 5) {
    scenario = 'active'; // 5 active members
  } else if (index < 7) {
    scenario = 'failed'; // 2 failed members
  } else if (index === 7) {
    scenario = 'suspended'; // 1 suspended
  } else if (index === 8) {
    scenario = 'pending'; // 1 pending first debit
  } else {
    scenario = 'arrears'; // 1 in arrears
  }
  
  const memberNumber = `${brokerGroup}${String(10000 + index).substring(1)}`;
  const netcashRef = `D1-${memberNumber}`;
  
  // Calculate dates
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, debitDay);
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, debitDay);
  
  let member = {
    member_number: memberNumber,
    first_name: firstName,
    last_name: lastName,
    id_number: generateIdNumber(),
    date_of_birth: '1985-06-15',
    gender: Math.random() > 0.5 ? 'male' : 'female',
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@test.com`,
    mobile: `082${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
    phone: null,
    
    address_line1: `${Math.floor(Math.random() * 999) + 1} Main Street`,
    address_line2: null,
    city: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'][Math.floor(Math.random() * 4)],
    postal_code: String(Math.floor(Math.random() * 9000) + 1000),
    
    bank_name: bank.name,
    account_number: generateAccountNumber(),
    branch_code: bank.branch,
    account_holder_name: `${firstName} ${lastName}`,
    
    broker_group: brokerGroup,
    debit_order_day: debitDay,
    monthly_premium: premium,
    
    netcash_account_reference: netcashRef,
    
    plan_name: 'Starter Hospital Plan',
    start_date: '2025-12-01',
    
    status: scenario === 'suspended' ? 'suspended' : 'active',
    kyc_status: 'verified',
    
    marketing_consent: true,
    email_consent: true,
    sms_consent: true,
    phone_consent: false,
    
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Apply scenario-specific data
  switch (scenario) {
    case 'active':
      member.payment_status = 'active';
      member.debit_order_status = 'active';
      member.last_payment_date = lastMonth.toISOString().split('T')[0];
      member.last_payment_amount = premium;
      member.last_debit_date = lastMonth.toISOString().split('T')[0];
      member.next_debit_date = nextMonth.toISOString().split('T')[0];
      member.failed_debit_count = 0;
      member.total_arrears = 0;
      member.debit_order_mandate_date = '2025-12-01';
      break;
      
    case 'failed':
      member.payment_status = 'rejected';
      member.debit_order_status = 'failed';
      member.last_payment_date = new Date(today.getFullYear(), today.getMonth() - 2, debitDay).toISOString().split('T')[0];
      member.last_payment_amount = premium;
      member.last_debit_date = lastMonth.toISOString().split('T')[0];
      member.next_debit_date = nextMonth.toISOString().split('T')[0];
      member.failed_debit_count = 1;
      member.total_arrears = premium;
      member.debit_order_mandate_date = '2025-12-01';
      break;
      
    case 'suspended':
      member.payment_status = 'suspended';
      member.debit_order_status = 'suspended';
      member.last_payment_date = new Date(today.getFullYear(), today.getMonth() - 3, debitDay).toISOString().split('T')[0];
      member.last_payment_amount = premium;
      member.last_debit_date = lastMonth.toISOString().split('T')[0];
      member.next_debit_date = null;
      member.failed_debit_count = 3;
      member.total_arrears = premium * 2;
      member.debit_order_mandate_date = '2025-12-01';
      break;
      
    case 'pending':
      member.payment_status = 'pending';
      member.debit_order_status = 'pending';
      member.last_payment_date = null;
      member.last_payment_amount = null;
      member.last_debit_date = null;
      member.next_debit_date = nextMonth.toISOString().split('T')[0];
      member.failed_debit_count = 0;
      member.total_arrears = 0;
      member.debit_order_mandate_date = new Date().toISOString().split('T')[0];
      break;
      
    case 'arrears':
      member.payment_status = 'active';
      member.debit_order_status = 'active';
      member.last_payment_date = new Date(today.getFullYear(), today.getMonth() - 3, debitDay).toISOString().split('T')[0];
      member.last_payment_amount = premium;
      member.last_debit_date = lastMonth.toISOString().split('T')[0];
      member.next_debit_date = nextMonth.toISOString().split('T')[0];
      member.failed_debit_count = 2;
      member.total_arrears = premium * 2;
      member.debit_order_mandate_date = '2025-12-01';
      break;
  }
  
  return member;
}

async function setupTestData() {
  console.log('🚀 Setting up Debit Order Test Data...\n');
  console.log('📊 Creating 10 test members per broker group (190 total)\n');
  
  try {
    let totalCreated = 0;
    let totalUpdated = 0;
    
    for (const brokerGroup of BROKER_GROUPS) {
      console.log(`\n📝 Processing ${brokerGroup}...`);
      
      // Get existing members for this broker group
      const response = await fetch(`${SUPABASE_URL}/rest/v1/members?broker_group=eq.${brokerGroup}&select=member_number&limit=10`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      const existingMembers = await response.json();
      
      // Update existing members with full test data
      for (let i = 0; i < existingMembers.length && i < 10; i++) {
        const memberNumber = existingMembers[i].member_number;
        const testData = generateTestMember(brokerGroup, i);
        
        // Remove member_number from update (it's the identifier)
        delete testData.member_number;
        
        const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/members?member_number=eq.${memberNumber}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(testData)
        });
        
        if (updateResponse.ok) {
          totalUpdated++;
        }
      }
      
      console.log(`✅ Updated ${Math.min(existingMembers.length, 10)} members`);
    }
    
    console.log('\n\n✅ TEST DATA SETUP COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   - Total members updated: ${totalUpdated}`);
    console.log(`   - Broker groups: ${BROKER_GROUPS.length}`);
    console.log('\n🧪 Test Scenarios per Group:');
    console.log('   - 5 Active (successful debit orders)');
    console.log('   - 2 Failed (insufficient funds)');
    console.log('   - 1 Suspended (too many failures)');
    console.log('   - 1 Pending (first debit)');
    console.log('   - 1 Arrears (missed 2 payments)');
    console.log('\n💳 Test Data Includes:');
    console.log('   - Realistic SA names & ID numbers');
    console.log('   - Different banks (Standard, FNB, ABSA, Nedbank, Capitec)');
    console.log('   - Different debit days (2, 10, 15, 20, 26, 27)');
    console.log('   - Different premiums (R325 - R2,262)');
    console.log('   - Payment history & arrears');
    console.log('   - Netcash account references');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupTestData();
