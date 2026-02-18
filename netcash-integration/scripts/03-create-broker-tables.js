/**
 * Create Broker Tables and Add Columns to Members
 * Direct SQL execution via Supabase
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function executeSql(sql, description) {
  console.log(`🔧 ${description}...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    console.log(`   ✅ Success`);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

async function createBrokerTables() {
  console.log('🏗️  CREATING BROKER TABLES AND COLUMNS');
  console.log('=' .repeat(80));
  console.log('');

  // Step 1: Create brokers table
  const createBrokersTable = `
    CREATE TABLE IF NOT EXISTS brokers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR(10) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      broker_commission_rate DECIMAL(5,2) DEFAULT 0.00,
      branch_commission_rate DECIMAL(5,2) DEFAULT 0.00,
      agent_commission_rate DECIMAL(5,2) DEFAULT 0.00,
      policy_prefix VARCHAR(10),
      status VARCHAR(20) DEFAULT 'active',
      member_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    COMMENT ON TABLE brokers IS 'Broker/distribution channels for Day1Health';
    COMMENT ON COLUMN brokers.code IS 'Broker code (DAY1, D1PAR, D1MAM, etc.)';
    COMMENT ON COLUMN brokers.broker_commission_rate IS 'Broker commission percentage';
    COMMENT ON COLUMN brokers.branch_commission_rate IS 'Branch commission percentage';
    COMMENT ON COLUMN brokers.agent_commission_rate IS 'Agent commission percentage';
  `;

  await executeSql(createBrokersTable, 'Creating brokers table');
  console.log('');

  // Step 2: Add broker columns to members table
  const addMemberColumns = `
    ALTER TABLE members ADD COLUMN IF NOT EXISTS broker_group VARCHAR(10);
    ALTER TABLE members ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES brokers(id);
    ALTER TABLE members ADD COLUMN IF NOT EXISTS debit_order_day INTEGER;
    ALTER TABLE members ADD COLUMN IF NOT EXISTS monthly_premium DECIMAL(10,2);
    ALTER TABLE members ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20);
    ALTER TABLE members ADD COLUMN IF NOT EXISTS last_payment_date DATE;
    ALTER TABLE members ADD COLUMN IF NOT EXISTS last_payment_amount DECIMAL(10,2);

    COMMENT ON COLUMN members.broker_group IS 'Broker/distribution channel code (DAY1, D1PAR, D1MAM, etc.)';
    COMMENT ON COLUMN members.debit_order_day IS 'Day of month for debit order (1-31)';
    COMMENT ON COLUMN members.monthly_premium IS 'Monthly premium amount in Rands';
    COMMENT ON COLUMN members.payment_status IS 'Current payment status (active, rejected, suspended)';
  `;

  await executeSql(addMemberColumns, 'Adding broker columns to members table');
  console.log('');

  // Step 3: Create indexes
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_members_broker_group ON members(broker_group);
    CREATE INDEX IF NOT EXISTS idx_members_broker_id ON members(broker_id);
    CREATE INDEX IF NOT EXISTS idx_members_debit_order_day ON members(debit_order_day);
    CREATE INDEX IF NOT EXISTS idx_members_payment_status ON members(payment_status);
  `;

  await executeSql(createIndexes, 'Creating indexes on members table');
  console.log('');

  // Step 4: Create payment_history table
  const createPaymentHistory = `
    CREATE TABLE IF NOT EXISTS payment_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      member_id UUID REFERENCES members(id) ON DELETE CASCADE,
      policy_number VARCHAR(50),
      broker_group VARCHAR(10),
      transaction_date DATE NOT NULL,
      debit_order_date DATE,
      amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) NOT NULL,
      rejection_reason TEXT,
      qsure_transaction_id VARCHAR(100),
      netcash_transaction_id VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_payment_history_member_id ON payment_history(member_id);
    CREATE INDEX IF NOT EXISTS idx_payment_history_policy_number ON payment_history(policy_number);
    CREATE INDEX IF NOT EXISTS idx_payment_history_broker_group ON payment_history(broker_group);
    CREATE INDEX IF NOT EXISTS idx_payment_history_transaction_date ON payment_history(transaction_date);
    CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

    COMMENT ON TABLE payment_history IS 'Historical payment transactions from Qsure and future Netcash';
    COMMENT ON COLUMN payment_history.status IS 'Payment status: success, rejected, pending, refunded';
  `;

  await executeSql(createPaymentHistory, 'Creating payment_history table');
  console.log('');

  // Step 5: Insert DAY1 broker
  const insertDAY1Broker = `
    INSERT INTO brokers (code, name, broker_commission_rate, branch_commission_rate, agent_commission_rate, policy_prefix, member_count)
    VALUES ('DAY1', 'Day1Health Direct', 0.00, 0.00, 0.00, 'DAY1', 996)
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      member_count = EXCLUDED.member_count;
  `;

  await executeSql(insertDAY1Broker, 'Inserting DAY1 broker record');
  console.log('');

  // Step 6: Insert all 19 brokers
  const insertAllBrokers = `
    INSERT INTO brokers (code, name, policy_prefix, status) VALUES
    ('D1PAR', 'Parabellum', 'PAR', 'active'),
    ('D1MAM', 'Mamela', 'MAM', 'active'),
    ('D1ACU', 'Acumen Holdings (PTY) LTD', 'ACU', 'active'),
    ('D1AIB', 'Assurity Insurance Broker', 'AIB', 'active'),
    ('D1ARC', 'ARC BPO', 'ARC', 'active'),
    ('D1AXS', 'Accsure', 'AXS', 'active'),
    ('D1BOU', 'Boulderson', 'BOU', 'active'),
    ('D1BPO', 'Agency BPO', 'BPO', 'active'),
    ('D1CSS', 'CSS Credit Solutions Services', 'CSS', 'active'),
    ('D1MED', 'Medi-Safu Brokers', 'MED', 'active'),
    ('D1MEM', 'Medi-Safu Brokers Montana', 'MEM', 'active'),
    ('D1MKT', 'MKT Marketing', 'MKT', 'active'),
    ('D1MTS', 'All My T', 'MTS', 'active'),
    ('D1NAV', 'Day1 Navigator', 'NAV', 'active'),
    ('D1RCO', 'Right Cover Online', 'RCO', 'active'),
    ('D1TFG', 'The Foschini Group', 'TFG', 'active'),
    ('D1THR', '360 Financial Service', 'THR', 'active'),
    ('D1TLD', 'Teledirect', 'TLD', 'active')
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      policy_prefix = EXCLUDED.policy_prefix;
  `;

  await executeSql(insertAllBrokers, 'Inserting all 19 broker records');
  console.log('');

  console.log('✅ DATABASE SETUP COMPLETE!');
  console.log('');
  console.log('Created:');
  console.log('  ✅ brokers table (with 19 broker records)');
  console.log('  ✅ payment_history table');
  console.log('  ✅ Broker columns in members table');
  console.log('  ✅ Indexes for fast queries');
  console.log('');
  console.log('Next steps:');
  console.log('1. Parse PDF: node 02-parse-qsure-pdf.js');
  console.log('2. Import members: node 04-import-day1-members.js');
}

createBrokerTables();
