-- ============================================================================
-- Netcash Integration - Database Schema
-- Day1Health Medical Insurer
-- ============================================================================

-- ============================================================================
-- 1. ADD NETCASH FIELDS TO EXISTING MEMBERS TABLE
-- ============================================================================

ALTER TABLE members ADD COLUMN IF NOT EXISTS netcash_account_reference VARCHAR(25) UNIQUE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS debit_order_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_debit_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS next_debit_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS failed_debit_count INT DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS debit_order_mandate_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS debicheck_mandate_id VARCHAR(50);
ALTER TABLE members ADD COLUMN IF NOT EXISTS debicheck_mandate_status VARCHAR(20);
ALTER TABLE members ADD COLUMN IF NOT EXISTS total_arrears DECIMAL(10,2) DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_payment_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_payment_amount DECIMAL(10,2);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_netcash_ref ON members(netcash_account_reference);
CREATE INDEX IF NOT EXISTS idx_members_debit_status ON members(debit_order_status);
CREATE INDEX IF NOT EXISTS idx_members_next_debit ON members(next_debit_date);

-- Add comments
COMMENT ON COLUMN members.netcash_account_reference IS 'Unique reference for Netcash system';
COMMENT ON COLUMN members.debit_order_status IS 'Status: pending, active, suspended, failed, cancelled';
COMMENT ON COLUMN members.debicheck_mandate_status IS 'DebiCheck status: pending, approved, rejected, expired';

-- ============================================================================
-- 2. DEBIT ORDER RUNS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS debit_order_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_date DATE NOT NULL,
  batch_name VARCHAR(100) NOT NULL,
  batch_type VARCHAR(20) NOT NULL, -- 'sameday', 'twoday', 'debicheck'
  total_members INT DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  successful_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  pending_count INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, submitted, completed, failed
  netcash_batch_id VARCHAR(50),
  netcash_service_key VARCHAR(100),
  file_path VARCHAR(255),
  upload_file_name VARCHAR(255),
  result_file_path VARCHAR(255),
  error_message TEXT,
  submitted_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_debit_runs_date ON debit_order_runs(run_date);
CREATE INDEX IF NOT EXISTS idx_debit_runs_status ON debit_order_runs(status);
CREATE INDEX IF NOT EXISTS idx_debit_runs_created ON debit_order_runs(created_at);

-- Comments
COMMENT ON TABLE debit_order_runs IS 'Monthly debit order batch runs';
COMMENT ON COLUMN debit_order_runs.batch_type IS 'Type of debit order: sameday, twoday, debicheck';
COMMENT ON COLUMN debit_order_runs.status IS 'Run status: pending, processing, submitted, completed, failed';

-- ============================================================================
-- 3. DEBIT ORDER TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS debit_order_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID REFERENCES debit_order_runs(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  member_number VARCHAR(50),
  member_name VARCHAR(200),
  account_reference VARCHAR(25),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, successful, failed, reversed, disputed
  netcash_reference VARCHAR(50),
  bank_reference VARCHAR(50),
  tracking_number VARCHAR(50),
  error_code VARCHAR(20),
  error_message TEXT,
  rejection_reason VARCHAR(255),
  processed_at TIMESTAMP,
  reversed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_debit_trans_run ON debit_order_transactions(run_id);
CREATE INDEX IF NOT EXISTS idx_debit_trans_member ON debit_order_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_debit_trans_status ON debit_order_transactions(status);
CREATE INDEX IF NOT EXISTS idx_debit_trans_date ON debit_order_transactions(processed_at);
CREATE INDEX IF NOT EXISTS idx_debit_trans_netcash_ref ON debit_order_transactions(netcash_reference);

-- Comments
COMMENT ON TABLE debit_order_transactions IS 'Individual debit order transactions per member';
COMMENT ON COLUMN debit_order_transactions.status IS 'Transaction status: pending, successful, failed, reversed, disputed';

-- ============================================================================
-- 4. PAYMENT HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES debit_order_transactions(id),
  payment_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_type VARCHAR(20) NOT NULL, -- 'debit_order', 'manual', 'card', 'eft'
  payment_method VARCHAR(50), -- 'netcash', 'qsure', 'manual_deposit', etc.
  reference_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'completed', -- pending, completed, reversed, failed
  description TEXT,
  reconciled BOOLEAN DEFAULT FALSE,
  reconciled_at TIMESTAMP,
  reconciled_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_member ON payment_history(member_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_date ON payment_history(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_reconciled ON payment_history(reconciled);

-- Comments
COMMENT ON TABLE payment_history IS 'Complete payment history for all members';
COMMENT ON COLUMN payment_history.payment_type IS 'Type: debit_order, manual, card, eft';

-- ============================================================================
-- 5. DEBICHECK MANDATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS debicheck_mandates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  mandate_reference VARCHAR(50) UNIQUE NOT NULL,
  contract_reference VARCHAR(50),
  maximum_amount DECIMAL(10,2) NOT NULL,
  frequency VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'annual'
  debit_day INT NOT NULL, -- 1-31
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, expired, cancelled
  request_date TIMESTAMP DEFAULT NOW(),
  approval_date TIMESTAMP,
  rejection_date TIMESTAMP,
  rejection_reason TEXT,
  expiry_date DATE,
  netcash_mandate_id VARCHAR(50),
  bank_name VARCHAR(100),
  account_number_masked VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_debicheck_member ON debicheck_mandates(member_id);
CREATE INDEX IF NOT EXISTS idx_debicheck_status ON debicheck_mandates(status);
CREATE INDEX IF NOT EXISTS idx_debicheck_reference ON debicheck_mandates(mandate_reference);

-- Comments
COMMENT ON TABLE debicheck_mandates IS 'DebiCheck mandate authorizations';
COMMENT ON COLUMN debicheck_mandates.status IS 'Mandate status: pending, approved, rejected, expired, cancelled';

-- ============================================================================
-- 6. NETCASH RECONCILIATION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS netcash_reconciliation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reconciliation_date DATE NOT NULL,
  run_id UUID REFERENCES debit_order_runs(id),
  bank_statement_file VARCHAR(255),
  total_expected DECIMAL(15,2),
  total_received DECIMAL(15,2),
  difference DECIMAL(15,2),
  matched_count INT DEFAULT 0,
  unmatched_count INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, discrepancy
  notes TEXT,
  reconciled_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reconciliation_date ON netcash_reconciliation(reconciliation_date);
CREATE INDEX IF NOT EXISTS idx_reconciliation_run ON netcash_reconciliation(run_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON netcash_reconciliation(status);

-- Comments
COMMENT ON TABLE netcash_reconciliation IS 'Payment reconciliation records';

-- ============================================================================
-- 7. NETCASH AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS netcash_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL, -- 'batch_created', 'batch_submitted', 'payment_received', etc.
  entity_type VARCHAR(50), -- 'run', 'transaction', 'mandate'
  entity_id UUID,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_netcash_audit_type ON netcash_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_netcash_audit_entity ON netcash_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_netcash_audit_user ON netcash_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_netcash_audit_created ON netcash_audit_log(created_at);

-- Comments
COMMENT ON TABLE netcash_audit_log IS 'Audit trail for all Netcash operations';

-- ============================================================================
-- 8. VIEWS FOR REPORTING
-- ============================================================================

-- Active members with debit order details
CREATE OR REPLACE VIEW v_active_debit_orders AS
SELECT 
  m.id,
  m.member_number,
  m.first_name,
  m.last_name,
  m.email,
  m.phone,
  m.monthly_premium,
  m.debit_order_day,
  m.bank_name,
  m.account_number,
  m.branch_code,
  m.netcash_account_reference,
  m.debit_order_status,
  m.last_debit_date,
  m.next_debit_date,
  m.failed_debit_count,
  m.total_arrears
FROM members m
WHERE m.status = 'active'
  AND m.debit_order_status IN ('active', 'pending');

-- Payment summary by member
CREATE OR REPLACE VIEW v_member_payment_summary AS
SELECT 
  m.id AS member_id,
  m.member_number,
  m.first_name || ' ' || m.last_name AS member_name,
  COUNT(ph.id) AS total_payments,
  SUM(ph.amount) AS total_paid,
  MAX(ph.payment_date) AS last_payment_date,
  m.monthly_premium,
  m.total_arrears
FROM members m
LEFT JOIN payment_history ph ON m.id = ph.member_id AND ph.status = 'completed'
GROUP BY m.id, m.member_number, m.first_name, m.last_name, m.monthly_premium, m.total_arrears;

-- Debit order run summary
CREATE OR REPLACE VIEW v_debit_run_summary AS
SELECT 
  dr.id,
  dr.run_date,
  dr.batch_name,
  dr.batch_type,
  dr.total_members,
  dr.total_amount,
  dr.successful_count,
  dr.failed_count,
  dr.status,
  dr.created_at,
  u.email AS created_by_email
FROM debit_order_runs dr
LEFT JOIN users u ON dr.created_by = u.id
ORDER BY dr.run_date DESC;

-- ============================================================================
-- 9. FUNCTIONS
-- ============================================================================

-- Function to generate unique Netcash account reference
CREATE OR REPLACE FUNCTION generate_netcash_reference(member_num VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
  RETURN 'D1-' || member_num;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate next debit date
CREATE OR REPLACE FUNCTION calculate_next_debit_date(debit_day INT)
RETURNS DATE AS $$
DECLARE
  next_date DATE;
BEGIN
  next_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + (debit_day - 1) * INTERVAL '1 day';
  IF next_date < CURRENT_DATE THEN
    next_date := next_date + INTERVAL '1 month';
  END IF;
  RETURN next_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_debit_runs_updated_at BEFORE UPDATE ON debit_order_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debit_trans_updated_at BEFORE UPDATE ON debit_order_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debicheck_updated_at BEFORE UPDATE ON debicheck_mandates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETE
-- ============================================================================

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO day1health_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO day1health_app;
