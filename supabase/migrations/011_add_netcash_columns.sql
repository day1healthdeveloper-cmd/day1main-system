-- ============================================================================
-- Add Netcash Integration Columns to Members Table
-- ============================================================================

-- Add Netcash-specific columns to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS netcash_account_reference VARCHAR(25) UNIQUE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS debit_order_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_debit_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS next_debit_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS failed_debit_count INT DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS debit_order_mandate_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS debicheck_mandate_id VARCHAR(50);
ALTER TABLE members ADD COLUMN IF NOT EXISTS debicheck_mandate_status VARCHAR(20);
ALTER TABLE members ADD COLUMN IF NOT EXISTS total_arrears DECIMAL(10,2) DEFAULT 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_netcash_ref ON members(netcash_account_reference);
CREATE INDEX IF NOT EXISTS idx_members_debit_status ON members(debit_order_status);
CREATE INDEX IF NOT EXISTS idx_members_next_debit ON members(next_debit_date);

-- Add comments
COMMENT ON COLUMN members.netcash_account_reference IS 'Unique reference for Netcash system (e.g., D1-DAY17038894)';
COMMENT ON COLUMN members.debit_order_status IS 'Status: pending, active, suspended, failed, cancelled';
COMMENT ON COLUMN members.last_debit_date IS 'Last debit order attempt date';
COMMENT ON COLUMN members.next_debit_date IS 'Next scheduled debit order date';
COMMENT ON COLUMN members.failed_debit_count IS 'Number of consecutive failed debit attempts';
COMMENT ON COLUMN members.debit_order_mandate_date IS 'Date when debit order mandate was signed';
COMMENT ON COLUMN members.debicheck_mandate_id IS 'DebiCheck mandate reference number';
COMMENT ON COLUMN members.debicheck_mandate_status IS 'DebiCheck status: pending, approved, rejected, expired';
COMMENT ON COLUMN members.total_arrears IS 'Total outstanding arrears amount';

-- Generate netcash_account_reference for existing members
UPDATE members 
SET netcash_account_reference = 'D1-' || member_number 
WHERE netcash_account_reference IS NULL;

-- Set debit_order_status to 'active' for members with payment_status = 'active'
UPDATE members 
SET debit_order_status = 'active' 
WHERE payment_status = 'active' AND debit_order_status = 'pending';

-- Calculate next_debit_date based on debit_order_day
UPDATE members 
SET next_debit_date = (
  CASE 
    WHEN EXTRACT(DAY FROM CURRENT_DATE) < debit_order_day 
    THEN DATE_TRUNC('month', CURRENT_DATE) + (debit_order_day - 1) * INTERVAL '1 day'
    ELSE DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + (debit_order_day - 1) * INTERVAL '1 day'
  END
)
WHERE debit_order_day IS NOT NULL AND next_debit_date IS NULL;
