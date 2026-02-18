/**
 * Add Netcash Columns to Members Table
 * Run: node add-netcash-columns.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ sql_query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${error}`);
  }

  return response.json();
}

async function addNetcashColumns() {
  console.log('🚀 Adding Netcash columns to members table...\n');

  try {
    // Step 1: Add columns
    console.log('📝 Step 1: Adding new columns...');
    
    const alterStatements = [
      "ALTER TABLE members ADD COLUMN IF NOT EXISTS netcash_account_reference VARCHAR(25);",
      "ALTER TABLE members ADD COLUMN IF NOT EXISTS debit_order_status VARCHAR(20) DEFAULT 'pending';",
      "ALTER TABLE members ADD COLUMN IF NOT EXISTS last_debit_date DATE;",
      "ALTER TABLE members ADD COLUMN IF NOT EXISTS next_debit_date DATE;",
      "ALTER TABLE members ADD COLUMN IF NOT EXISTS failed_debit_count INT DEFAULT 0;",
      "ALTER TABLE members ADD COLUMN IF NOT EXISTS debit_order_mandate_date DATE;",
      "ALTER TABLE members ADD COLUMN IF NOT EXISTS debicheck_mandate_id VARCHAR(50);",
      "ALTER TABLE members ADD COLUMN IF NOT EXISTS debicheck_mandate_status VARCHAR(20);",
      "ALTER TABLE members ADD COLUMN IF NOT EXISTS total_arrears DECIMAL(10,2) DEFAULT 0;"
    ];

    for (const statement of alterStatements) {
      try {
        await executeSql(statement);
        console.log('✅', statement.substring(0, 60) + '...');
      } catch (err) {
        console.log('⚠️ ', err.message);
      }
    }

    // Step 2: Create indexes
    console.log('\n📝 Step 2: Creating indexes...');
    
    const indexStatements = [
      "CREATE INDEX IF NOT EXISTS idx_members_netcash_ref ON members(netcash_account_reference);",
      "CREATE INDEX IF NOT EXISTS idx_members_debit_status ON members(debit_order_status);",
      "CREATE INDEX IF NOT EXISTS idx_members_next_debit ON members(next_debit_date);"
    ];

    for (const statement of indexStatements) {
      try {
        await executeSql(statement);
        console.log('✅', statement.substring(0, 60) + '...');
      } catch (err) {
        console.log('⚠️ ', err.message);
      }
    }

    // Step 3: Generate netcash references for existing members
    console.log('\n📝 Step 3: Generating Netcash account references...');
    
    const { data: members } = await fetch(`${SUPABASE_URL}/rest/v1/members?select=id,member_number,netcash_account_reference`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    }).then(r => r.json());

    let updated = 0;
    for (const member of members) {
      if (!member.netcash_account_reference) {
        const netcashRef = `D1-${member.member_number}`;
        
        await fetch(`${SUPABASE_URL}/rest/v1/members?id=eq.${member.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ netcash_account_reference: netcashRef })
        });
        
        updated++;
      }
    }
    
    console.log(`✅ Generated ${updated} Netcash account references`);

    // Step 4: Set debit_order_status for active members
    console.log('\n📝 Step 4: Setting debit order status...');
    
    const { data: activeMembers } = await fetch(`${SUPABASE_URL}/rest/v1/members?payment_status=eq.active&select=id`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    }).then(r => r.json());

    if (activeMembers && activeMembers.length > 0) {
      for (const member of activeMembers) {
        await fetch(`${SUPABASE_URL}/rest/v1/members?id=eq.${member.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ debit_order_status: 'active' })
        });
      }
      console.log(`✅ Set debit_order_status='active' for ${activeMembers.length} members`);
    }

    // Step 5: Calculate next_debit_date
    console.log('\n📝 Step 5: Calculating next debit dates...');
    
    const { data: membersWithDebitDay } = await fetch(`${SUPABASE_URL}/rest/v1/members?select=id,debit_order_day&debit_order_day=not.is.null`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    }).then(r => r.json());

    let datesCalculated = 0;
    const today = new Date();
    const currentDay = today.getDate();
    
    for (const member of membersWithDebitDay) {
      const debitDay = member.debit_order_day;
      let nextDate;
      
      if (currentDay < debitDay) {
        // This month
        nextDate = new Date(today.getFullYear(), today.getMonth(), debitDay);
      } else {
        // Next month
        nextDate = new Date(today.getFullYear(), today.getMonth() + 1, debitDay);
      }
      
      const nextDateStr = nextDate.toISOString().split('T')[0];
      
      await fetch(`${SUPABASE_URL}/rest/v1/members?id=eq.${member.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ next_debit_date: nextDateStr })
      });
      
      datesCalculated++;
    }
    
    console.log(`✅ Calculated next_debit_date for ${datesCalculated} members`);

    // Verify
    console.log('\n📊 Verification...\n');
    
    const { data: sample } = await fetch(`${SUPABASE_URL}/rest/v1/members?select=member_number,netcash_account_reference,debit_order_status,next_debit_date,failed_debit_count,total_arrears&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    }).then(r => r.json());

    console.table(sample);

    console.log('\n✅ Netcash columns added successfully!\n');
    console.log('New columns added:');
    console.log('  1. netcash_account_reference');
    console.log('  2. debit_order_status');
    console.log('  3. last_debit_date');
    console.log('  4. next_debit_date');
    console.log('  5. failed_debit_count');
    console.log('  6. debit_order_mandate_date');
    console.log('  7. debicheck_mandate_id');
    console.log('  8. debicheck_mandate_status');
    console.log('  9. total_arrears\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addNetcashColumns();
