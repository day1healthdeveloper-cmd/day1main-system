-- ============================================================================
-- BROKER MIGRATION SQL
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

-- Step 1: Create brokers table
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

-- Step 2: Add broker columns to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS broker_group VARCHAR(10);
ALTER TABLE members ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES brokers(id);
ALTER TABLE members ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20);
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_payment_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_payment_amount DECIMAL(10,2);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_members_broker_group ON members(broker_group);
CREATE INDEX IF NOT EXISTS idx_members_broker_id ON members(broker_id);
CREATE INDEX IF NOT EXISTS idx_members_payment_status ON members(payment_status);

-- Step 4: Create payment_history table
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
  source VARCHAR(20) DEFAULT 'qsure',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 5: Create indexes on payment_history
CREATE INDEX IF NOT EXISTS idx_payment_history_member_id ON payment_history(member_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_policy_number ON payment_history(policy_number);
CREATE INDEX IF NOT EXISTS idx_payment_history_broker_group ON payment_history(broker_group);
CREATE INDEX IF NOT EXISTS idx_payment_history_transaction_date ON payment_history(transaction_date);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

-- Step 6: Insert all 19 broker records
INSERT INTO brokers (code, name, broker_commission_rate, branch_commission_rate, agent_commission_rate, policy_prefix, member_count, status) VALUES
('DAY1', 'Day1Health Direct', 0.00, 0.00, 0.00, 'DAY1', 996, 'active'),
('D1PAR', 'Parabellum', 5.00, 2.00, 1.00, 'PAR', 1447, 'active'),
('D1MAM', 'Mamela', 5.00, 2.00, 1.00, 'MAM', 0, 'active'),
('D1ACU', 'Acumen Holdings (PTY) LTD', 5.00, 2.00, 1.00, 'ACU', 6, 'active'),
('D1AIB', 'Assurity Insurance Broker', 5.00, 2.00, 1.00, 'AIB', 0, 'active'),
('D1ARC', 'ARC BPO', 5.00, 2.00, 1.00, 'ARC', 0, 'active'),
('D1AXS', 'Accsure', 5.00, 2.00, 1.00, 'AXS', 0, 'active'),
('D1BOU', 'Boulderson', 5.00, 2.00, 1.00, 'BOU', 0, 'active'),
('D1BPO', 'Agency BPO', 5.00, 2.00, 1.00, 'BPO', 0, 'active'),
('D1CSS', 'CSS Credit Solutions Services', 5.00, 2.00, 1.00, 'CSS', 0, 'active'),
('D1MED', 'Medi-Safu Brokers', 5.00, 2.00, 1.00, 'MED', 574, 'active'),
('D1MEM', 'Medi-Safu Brokers Montana', 5.00, 2.00, 1.00, 'MEM', 0, 'active'),
('D1MKT', 'MKT Marketing', 5.00, 2.00, 1.00, 'MKT', 610, 'active'),
('D1MTS', 'All My T', 5.00, 2.00, 1.00, 'MTS', 0, 'active'),
('D1NAV', 'Day1 Navigator', 5.00, 2.00, 1.00, 'NAV', 381, 'active'),
('D1RCO', 'Right Cover Online', 5.00, 2.00, 1.00, 'RCO', 0, 'active'),
('D1TFG', 'The Foschini Group', 5.00, 2.00, 1.00, 'TFG', 0, 'active'),
('D1THR', '360 Financial Service', 5.00, 2.00, 1.00, 'THR', 0, 'active'),
('D1TLD', 'Teledirect', 5.00, 2.00, 1.00, 'TLD', 0, 'active')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  member_count = EXCLUDED.member_count;

-- Done! Now verify:
SELECT code, name, member_count FROM brokers ORDER BY code;
