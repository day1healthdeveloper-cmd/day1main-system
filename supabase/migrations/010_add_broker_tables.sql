-- Migration: Add Broker Tables and Columns
-- Created: 2026-02-08
-- Description: Creates brokers table, payment_history table, and adds broker columns to members

-- ============================================================================
-- STEP 1: Create brokers table
-- ============================================================================

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

-- ============================================================================
-- STEP 2: Add broker columns to members table
-- ============================================================================

ALTER TABLE members ADD COLUMN IF NOT EXISTS broker_group VARCHAR(10);
ALTER TABLE members ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES brokers(id);
ALTER TABLE members ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20);
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_payment_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_payment_amount DECIMAL(10,2);

COMMENT ON COLUMN members.broker_group IS 'Broker/distribution channel code (DAY1, D1PAR, D1MAM, etc.)';
COMMENT ON COLUMN members.payment_status IS 'Current payment status (active, rejected, suspended)';

-- ============================================================================
-- STEP 3: Create indexes on members table
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_members_broker_group ON members(broker_group);
CREATE INDEX IF NOT EXISTS idx_members_broker_id ON members(broker_id);
CREATE INDEX IF NOT EXISTS idx_members_payment_status ON members(payment_status);

-- ============================================================================
-- STEP 4: Create payment_history table
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS idx_payment_history_member_id ON payment_history(member_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_policy_number ON payment_history(policy_number);
CREATE INDEX IF NOT EXISTS idx_payment_history_broker_group ON payment_history(broker_group);
CREATE INDEX IF NOT EXISTS idx_payment_history_transaction_date ON payment_history(transaction_date);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

COMMENT ON TABLE payment_history IS 'Historical payment transactions from Qsure and future Netcash';
COMMENT ON COLUMN payment_history.status IS 'Payment status: success, rejected, pending, refunded';
COMMENT ON COLUMN payment_history.source IS 'Payment source: qsure, netcash';

-- ============================================================================
-- STEP 5: Insert all 19 broker records
-- ============================================================================

INSERT INTO brokers (code, name, broker_commission_rate, branch_commission_rate, agent_commission_rate, policy_prefix, member_count) VALUES
('DAY1', 'Day1Health Direct', 0.00, 0.00, 0.00, 'DAY1', 996),
('D1PAR', 'Parabellum', 5.00, 2.00, 1.00, 'PAR', 1447),
('D1MAM', 'Mamela', 5.00, 2.00, 1.00, 'MAM', 0),
('D1ACU', 'Acumen Holdings (PTY) LTD', 5.00, 2.00, 1.00, 'ACU', 6),
('D1AIB', 'Assurity Insurance Broker', 5.00, 2.00, 1.00, 'AIB', 0),
('D1ARC', 'ARC BPO', 5.00, 2.00, 1.00, 'ARC', 0),
('D1AXS', 'Accsure', 5.00, 2.00, 1.00, 'AXS', 0),
('D1BOU', 'Boulderson', 5.00, 2.00, 1.00, 'BOU', 0),
('D1BPO', 'Agency BPO', 5.00, 2.00, 1.00, 'BPO', 0),
('D1CSS', 'CSS Credit Solutions Services', 5.00, 2.00, 1.00, 'CSS', 0),
('D1MED', 'Medi-Safu Brokers', 5.00, 2.00, 1.00, 'MED', 574),
('D1MEM', 'Medi-Safu Brokers Montana', 5.00, 2.00, 1.00, 'MEM', 0),
('D1MKT', 'MKT Marketing', 5.00, 2.00, 1.00, 'MKT', 610),
('D1MTS', 'All My T', 5.00, 2.00, 1.00, 'MTS', 0),
('D1NAV', 'Day1 Navigator', 5.00, 2.00, 1.00, 'NAV', 381),
('D1RCO', 'Right Cover Online', 5.00, 2.00, 1.00, 'RCO', 0),
('D1TFG', 'The Foschini Group', 5.00, 2.00, 1.00, 'TFG', 0),
('D1THR', '360 Financial Service', 5.00, 2.00, 1.00, 'THR', 0),
('D1TLD', 'Teledirect', 5.00, 2.00, 1.00, 'TLD', 0)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  member_count = EXCLUDED.member_count,
  policy_prefix = EXCLUDED.policy_prefix;

-- ============================================================================
-- STEP 6: Create function to update broker member counts
-- ============================================================================

CREATE OR REPLACE FUNCTION update_broker_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE brokers
    SET member_count = (
      SELECT COUNT(*) FROM members WHERE broker_id = NEW.broker_id
    )
    WHERE id = NEW.broker_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE brokers
    SET member_count = (
      SELECT COUNT(*) FROM members WHERE broker_id = OLD.broker_id
    )
    WHERE id = OLD.broker_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 7: Create trigger to auto-update broker member counts
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_update_broker_member_count ON members;

CREATE TRIGGER trigger_update_broker_member_count
  AFTER INSERT OR UPDATE OR DELETE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_broker_member_count();

-- ============================================================================
-- DONE
-- ============================================================================
