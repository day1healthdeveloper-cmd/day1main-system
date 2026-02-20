-- ============================================================================
-- Payment Groups Schema - For Group Debit Orders and EFT Collections
-- ============================================================================

-- 1. PAYMENT GROUPS TABLE
CREATE TABLE IF NOT EXISTS payment_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_code VARCHAR(50) UNIQUE NOT NULL,
  group_name VARCHAR(200) NOT NULL,
  group_type VARCHAR(50) NOT NULL, -- 'debit_order_group', 'eft_group'
  
  -- Company Information
  company_name VARCHAR(200) NOT NULL,
  company_registration VARCHAR(50),
  vat_number VARCHAR(50),
  
  -- Contact Information
  contact_person VARCHAR(200),
  contact_email VARCHAR(200),
  contact_phone VARCHAR(50),
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  
  -- Banking Details (for debit order groups)
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  branch_code VARCHAR(20),
  account_holder_name VARCHAR(200),
  account_type VARCHAR(50), -- 'current', 'savings', 'business'
  
  -- Payment Configuration
  collection_method VARCHAR(50) NOT NULL, -- 'group_debit_order', 'individual_eft'
  collection_day INT, -- Day of month (1-31)
  collection_frequency VARCHAR(50) DEFAULT 'monthly', -- 'monthly', 'quarterly', 'annual'
  
  -- Netcash Configuration (for debit order groups)
  netcash_group_reference VARCHAR(50),
  netcash_service_key VARCHAR(100),
  
  -- Status and Tracking
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
  total_members INT DEFAULT 0,
  total_monthly_premium DECIMAL(15,2) DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  
  -- Notes
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_payment_groups_code ON payment_groups(group_code);
CREATE INDEX IF NOT EXISTS idx_payment_groups_type ON payment_groups(group_type);
CREATE INDEX IF NOT EXISTS idx_payment_groups_status ON payment_groups(status);
CREATE INDEX IF NOT EXISTS idx_payment_groups_collection_method ON payment_groups(collection_method);

-- 2. ADD GROUP REFERENCE TO MEMBERS TABLE
ALTER TABLE members ADD COLUMN IF NOT EXISTS payment_group_id UUID REFERENCES payment_groups(id);
ALTER TABLE members ADD COLUMN IF NOT EXISTS collection_method VARCHAR(50) DEFAULT 'individual_debit_order';
-- collection_method values: 'individual_debit_order', 'group_debit_order', 'individual_eft'

CREATE INDEX IF NOT EXISTS idx_members_payment_group ON members(payment_group_id);
CREATE INDEX IF NOT EXISTS idx_members_collection_method ON members(collection_method);

-- 3. GROUP PAYMENT HISTORY TABLE
CREATE TABLE IF NOT EXISTS group_payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES payment_groups(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  
  -- Payment Details
  total_amount DECIMAL(15,2) NOT NULL,
  member_count INT NOT NULL,
  payment_method VARCHAR(50), -- 'debit_order', 'eft', 'manual'
  
  -- Transaction Details
  transaction_reference VARCHAR(100),
  netcash_reference VARCHAR(100),
  bank_reference VARCHAR(100),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'reversed'
  
  -- Reconciliation
  reconciled BOOLEAN DEFAULT FALSE,
  reconciled_at TIMESTAMP,
  reconciled_by UUID REFERENCES users(id),
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  processed_at TIMESTAMP,
  
  -- Notes
  notes TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_group_payment_history_group ON group_payment_history(group_id);
CREATE INDEX IF NOT EXISTS idx_group_payment_history_date ON group_payment_history(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_group_payment_history_status ON group_payment_history(status);
CREATE INDEX IF NOT EXISTS idx_group_payment_history_reconciled ON group_payment_history(reconciled);

-- 4. GROUP MEMBER PAYMENT BREAKDOWN TABLE
CREATE TABLE IF NOT EXISTS group_member_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_payment_id UUID REFERENCES group_payment_history(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  
  -- Member Details
  member_number VARCHAR(50),
  member_name VARCHAR(200),
  
  -- Payment Details
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  
  -- Status
  included_in_group_payment BOOLEAN DEFAULT TRUE,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_member_payments_group_payment ON group_member_payments(group_payment_id);
CREATE INDEX IF NOT EXISTS idx_group_member_payments_member ON group_member_payments(member_id);
CREATE INDEX IF NOT EXISTS idx_group_member_payments_date ON group_member_payments(payment_date DESC);

-- 5. GROUP DEBIT ORDER RUNS TABLE (extends debit_order_runs)
ALTER TABLE debit_order_runs ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES payment_groups(id);
ALTER TABLE debit_order_runs ADD COLUMN IF NOT EXISTS is_group_run BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_debit_order_runs_group ON debit_order_runs(group_id);

-- 6. EFT PAYMENT NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS eft_payment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  group_id UUID REFERENCES payment_groups(id),
  
  -- Notification Details
  notification_date DATE NOT NULL,
  payment_due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  
  -- Notification Channels
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  sms_sent BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMP,
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  whatsapp_sent_at TIMESTAMP,
  
  -- Payment Status
  payment_received BOOLEAN DEFAULT FALSE,
  payment_received_at TIMESTAMP,
  payment_reference VARCHAR(100),
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_eft_notifications_member ON eft_payment_notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_eft_notifications_group ON eft_payment_notifications(group_id);
CREATE INDEX IF NOT EXISTS idx_eft_notifications_due_date ON eft_payment_notifications(payment_due_date);
CREATE INDEX IF NOT EXISTS idx_eft_notifications_received ON eft_payment_notifications(payment_received);

-- 7. TRIGGERS FOR AUTO-UPDATING GROUP TOTALS
CREATE OR REPLACE FUNCTION update_group_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total members and total premium for the group
  UPDATE payment_groups
  SET 
    total_members = (
      SELECT COUNT(*) 
      FROM members 
      WHERE payment_group_id = COALESCE(NEW.payment_group_id, OLD.payment_group_id)
      AND status = 'active'
    ),
    total_monthly_premium = (
      SELECT COALESCE(SUM(monthly_premium), 0)
      FROM members 
      WHERE payment_group_id = COALESCE(NEW.payment_group_id, OLD.payment_group_id)
      AND status = 'active'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.payment_group_id, OLD.payment_group_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_group_totals ON members;
CREATE TRIGGER trigger_update_group_totals
AFTER INSERT OR UPDATE OR DELETE ON members
FOR EACH ROW
EXECUTE FUNCTION update_group_totals();

-- 8. TRIGGER FOR UPDATED_AT
DROP TRIGGER IF EXISTS update_payment_groups_updated_at ON payment_groups;
CREATE TRIGGER update_payment_groups_updated_at 
BEFORE UPDATE ON payment_groups 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETE! Payment Groups schema created successfully
-- ============================================================================

-- 7. FUNCTION FOR AUTO-UPDATING GROUP TOTALS
CREATE OR REPLACE FUNCTION update_group_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE payment_groups
    SET 
      total_members = (SELECT COUNT(*) FROM members WHERE payment_group_id = OLD.payment_group_id AND status = 'active'),
      total_monthly_premium = (SELECT COALESCE(SUM(monthly_premium), 0) FROM members WHERE payment_group_id = OLD.payment_group_id AND status = 'active'),
      updated_at = NOW()
    WHERE id = OLD.payment_group_id;
    RETURN OLD;
  ELSE
    IF NEW.payment_group_id IS NOT NULL THEN
      UPDATE payment_groups
      SET 
        total_members = (SELECT COUNT(*) FROM members WHERE payment_group_id = NEW.payment_group_id AND status = 'active'),
        total_monthly_premium = (SELECT COALESCE(SUM(monthly_premium), 0) FROM members WHERE payment_group_id = NEW.payment_group_id AND status = 'active'),
        updated_at = NOW()
      WHERE id = NEW.payment_group_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGER FOR AUTO-UPDATING GROUP TOTALS
DROP TRIGGER IF EXISTS trigger_update_group_totals ON members;
CREATE TRIGGER trigger_update_group_totals
AFTER INSERT OR UPDATE OR DELETE ON members
FOR EACH ROW
EXECUTE FUNCTION update_group_totals();

-- 9. TRIGGER FOR UPDATED_AT
DROP TRIGGER IF EXISTS update_payment_groups_updated_at ON payment_groups;
CREATE TRIGGER update_payment_groups_updated_at 
BEFORE UPDATE ON payment_groups 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETE! Payment Groups schema created successfully
-- ============================================================================
