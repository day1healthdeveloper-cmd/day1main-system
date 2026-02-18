-- ============================================================================
-- Netcash Integration - Complete Schema for Supabase
-- Copy and paste this entire file into Supabase SQL Editor and run
-- ============================================================================

-- 1. ADD NETCASH FIELDS TO MEMBERS TABLE
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

CREATE INDEX IF NOT EXISTS idx_members_netcash_ref ON members(netcash_account_reference);
CREATE INDEX IF NOT EXISTS idx_members_debit_status ON members(debit_order_status);
CREATE INDEX IF NOT EXISTS idx_members_next_debit ON members(next_debit_date);

-- 2. DEBIT ORDER RUNS TABLE
CREATE TABLE IF NOT EXISTS debit_order_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date DATE NOT NULL,
  batch_name VARCHAR(100) NOT NULL,
  batch_type VARCHAR(20) NOT NULL,
  total_members INT DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  successful_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  pending_count INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  netcash_batch_id VARCHAR(50),
  netcash_service_key VARCHAR(100),
  file_path VARCHAR(255),
  upload_file_name VARCHAR(255),
  result_file_path VARCHAR(255),
  error_message TEXT,
  submitted_at TIMESTAMP,
  completed_at TIMESTAMP,
  netcash_batch_reference VARCHAR(255),
  netcash_status VARCHAR(50),
  last_status_check TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debit_runs_date ON debit_order_runs(run_date);
CREATE INDEX IF NOT EXISTS idx_debit_runs_status ON debit_order_runs(status);
CREATE INDEX IF NOT EXISTS idx_debit_runs_created ON debit_order_runs(created_at);
CREATE INDEX IF NOT EXISTS idx_debit_order_runs_netcash_ref ON debit_order_runs(netcash_batch_reference);

-- 3. DEBIT ORDER TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS debit_order_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES debit_order_runs(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  member_number VARCHAR(50),
  member_name VARCHAR(200),
  account_reference VARCHAR(25),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
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

CREATE INDEX IF NOT EXISTS idx_debit_trans_run ON debit_order_transactions(run_id);
CREATE INDEX IF NOT EXISTS idx_debit_trans_member ON debit_order_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_debit_trans_status ON debit_order_transactions(status);
CREATE INDEX IF NOT EXISTS idx_debit_trans_date ON debit_order_transactions(processed_at);
CREATE INDEX IF NOT EXISTS idx_debit_trans_netcash_ref ON debit_order_transactions(netcash_reference);

-- 4. PAYMENT HISTORY TABLE
-- Note: This table may already exist, so we'll only add missing columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_history') THEN
    CREATE TABLE payment_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      member_id UUID REFERENCES members(id) ON DELETE CASCADE,
      transaction_id UUID REFERENCES debit_order_transactions(id),
      payment_date DATE NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_type VARCHAR(20) NOT NULL,
      payment_method VARCHAR(50),
      reference_number VARCHAR(100),
      status VARCHAR(20) DEFAULT 'completed',
      description TEXT,
      reconciled BOOLEAN DEFAULT FALSE,
      reconciled_at TIMESTAMP,
      reconciled_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      created_by UUID REFERENCES users(id)
    );
  END IF;
END $$;

-- Add missing columns if table already exists
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES debit_order_transactions(id);
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS payment_date DATE;
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20);
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS reference_number VARCHAR(100);
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS reconciled BOOLEAN DEFAULT FALSE;
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMP;
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS reconciled_by UUID REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_payment_history_member ON payment_history(member_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_date ON payment_history(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_reconciled ON payment_history(reconciled);

-- 5. DEBICHECK MANDATES TABLE
CREATE TABLE IF NOT EXISTS debicheck_mandates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  mandate_reference VARCHAR(50) UNIQUE NOT NULL,
  contract_reference VARCHAR(50),
  maximum_amount DECIMAL(10,2) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  debit_day INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
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

CREATE INDEX IF NOT EXISTS idx_debicheck_member ON debicheck_mandates(member_id);
CREATE INDEX IF NOT EXISTS idx_debicheck_status ON debicheck_mandates(status);
CREATE INDEX IF NOT EXISTS idx_debicheck_reference ON debicheck_mandates(mandate_reference);

-- 6. NETCASH RECONCILIATION TABLE
CREATE TABLE IF NOT EXISTS netcash_reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_date DATE NOT NULL,
  run_id UUID REFERENCES debit_order_runs(id),
  bank_statement_file VARCHAR(255),
  total_expected DECIMAL(15,2),
  total_received DECIMAL(15,2),
  difference DECIMAL(15,2),
  matched_count INT DEFAULT 0,
  unmatched_count INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  reconciled_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_date ON netcash_reconciliation(reconciliation_date);
CREATE INDEX IF NOT EXISTS idx_reconciliation_run ON netcash_reconciliation(run_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON netcash_reconciliation(status);

-- 7. NETCASH AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS netcash_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_netcash_audit_type ON netcash_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_netcash_audit_entity ON netcash_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_netcash_audit_user ON netcash_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_netcash_audit_created ON netcash_audit_log(created_at);

-- 8. REFUND REQUESTS TABLE (Migration 009)
CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  original_transaction_id UUID REFERENCES debit_order_transactions(id),
  original_run_id UUID REFERENCES debit_order_runs(id),
  refund_amount DECIMAL(10,2) NOT NULL,
  refund_reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  netcash_refund_reference VARCHAR(255),
  netcash_response TEXT,
  requested_by UUID REFERENCES users(id),
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refund_requests_member_id ON refund_requests(member_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_requested_at ON refund_requests(requested_at DESC);

-- 9. PAYMENT RECONCILIATIONS TABLE (Enhanced)
CREATE TABLE IF NOT EXISTS payment_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_date DATE NOT NULL,
  run_id UUID REFERENCES debit_order_runs(id),
  total_expected DECIMAL(10,2) NOT NULL,
  total_received DECIMAL(10,2) NOT NULL,
  matched_count INTEGER DEFAULT 0,
  unmatched_count INTEGER DEFAULT 0,
  discrepancy_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  reconciled_by UUID REFERENCES users(id),
  reconciled_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reconciliations_date ON payment_reconciliations(reconciliation_date DESC);
CREATE INDEX IF NOT EXISTS idx_reconciliations_status ON payment_reconciliations(status);

-- 10. PAYMENT DISCREPANCIES TABLE
CREATE TABLE IF NOT EXISTS payment_discrepancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_id UUID REFERENCES payment_reconciliations(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  transaction_id UUID REFERENCES debit_order_transactions(id),
  expected_amount DECIMAL(10,2) NOT NULL,
  received_amount DECIMAL(10,2),
  difference DECIMAL(10,2) NOT NULL,
  discrepancy_type VARCHAR(50),
  reason TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discrepancies_reconciliation_id ON payment_discrepancies(reconciliation_id);
CREATE INDEX IF NOT EXISTS idx_discrepancies_member_id ON payment_discrepancies(member_id);
CREATE INDEX IF NOT EXISTS idx_discrepancies_resolved ON payment_discrepancies(resolved);

-- 11. NETCASH WEBHOOK LOGS TABLE
CREATE TABLE IF NOT EXISTS netcash_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_type VARCHAR(100),
  payload JSONB NOT NULL,
  signature VARCHAR(255),
  signature_valid BOOLEAN,
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT,
  related_transaction_id UUID REFERENCES debit_order_transactions(id),
  related_refund_id UUID REFERENCES refund_requests(id),
  related_mandate_id UUID REFERENCES debicheck_mandates(id),
  received_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON netcash_webhook_logs(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_received_at ON netcash_webhook_logs(received_at DESC);

-- 12. TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_debit_runs_updated_at ON debit_order_runs;
CREATE TRIGGER update_debit_runs_updated_at BEFORE UPDATE ON debit_order_runs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_debit_trans_updated_at ON debit_order_transactions;
CREATE TRIGGER update_debit_trans_updated_at BEFORE UPDATE ON debit_order_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_debicheck_updated_at ON debicheck_mandates;
CREATE TRIGGER update_debicheck_updated_at BEFORE UPDATE ON debicheck_mandates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_refund_requests_updated_at ON refund_requests;
CREATE TRIGGER update_refund_requests_updated_at BEFORE UPDATE ON refund_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reconciliations_updated_at ON payment_reconciliations;
CREATE TRIGGER update_reconciliations_updated_at BEFORE UPDATE ON payment_reconciliations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_discrepancies_updated_at ON payment_discrepancies;
CREATE TRIGGER update_discrepancies_updated_at BEFORE UPDATE ON payment_discrepancies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETE! All Netcash tables created successfully
-- ============================================================================
