-- Migration 009: Refunds and Additional Transaction Features
-- Purpose: Add refund management and enhanced transaction tracking
-- Note: Assumes base Netcash schema (debit_order_runs, debit_order_transactions) already exists

-- Refund Requests Table
CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  original_transaction_id UUID REFERENCES debit_order_transactions(id),
  original_run_id UUID REFERENCES debit_order_runs(id),
  refund_amount DECIMAL(10,2) NOT NULL,
  refund_reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
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

-- Payment Reconciliations Table (enhanced version)
CREATE TABLE IF NOT EXISTS payment_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_date DATE NOT NULL,
  run_id UUID REFERENCES debit_order_runs(id),
  total_expected DECIMAL(10,2) NOT NULL,
  total_received DECIMAL(10,2) NOT NULL,
  matched_count INTEGER DEFAULT 0,
  unmatched_count INTEGER DEFAULT 0,
  discrepancy_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, reviewed, approved
  reconciled_by UUID REFERENCES users(id),
  reconciled_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment Discrepancies Table
CREATE TABLE IF NOT EXISTS payment_discrepancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_id UUID REFERENCES payment_reconciliations(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  transaction_id UUID REFERENCES debit_order_transactions(id),
  expected_amount DECIMAL(10,2) NOT NULL,
  received_amount DECIMAL(10,2),
  difference DECIMAL(10,2) NOT NULL,
  discrepancy_type VARCHAR(50), -- missing_payment, incorrect_amount, duplicate_payment, unidentified_payment
  reason TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Netcash Webhook Logs Table
CREATE TABLE IF NOT EXISTS netcash_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_type VARCHAR(100), -- payment_notification, mandate_status, refund_confirmation
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_refund_requests_member_id ON refund_requests(member_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_requested_at ON refund_requests(requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_reconciliations_date ON payment_reconciliations(reconciliation_date DESC);
CREATE INDEX IF NOT EXISTS idx_reconciliations_status ON payment_reconciliations(status);

CREATE INDEX IF NOT EXISTS idx_discrepancies_reconciliation_id ON payment_discrepancies(reconciliation_id);
CREATE INDEX IF NOT EXISTS idx_discrepancies_member_id ON payment_discrepancies(member_id);
CREATE INDEX IF NOT EXISTS idx_discrepancies_resolved ON payment_discrepancies(resolved);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON netcash_webhook_logs(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_received_at ON netcash_webhook_logs(received_at DESC);

-- Add updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_refund_requests_updated_at ON refund_requests;
CREATE TRIGGER update_refund_requests_updated_at BEFORE UPDATE ON refund_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reconciliations_updated_at ON payment_reconciliations;
CREATE TRIGGER update_reconciliations_updated_at BEFORE UPDATE ON payment_reconciliations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_discrepancies_updated_at ON payment_discrepancies;
CREATE TRIGGER update_discrepancies_updated_at BEFORE UPDATE ON payment_discrepancies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE refund_requests IS 'Tracks refund requests for members';
COMMENT ON TABLE payment_reconciliations IS 'Daily payment reconciliation records';
COMMENT ON TABLE payment_discrepancies IS 'Payment discrepancies found during reconciliation';
COMMENT ON TABLE netcash_webhook_logs IS 'Logs of webhooks received from Netcash';
