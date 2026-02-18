-- Migration: Hybrid Contact Database
-- Created: 2026-01-22
-- Description: Creates contacts table and links to applications/members

-- STEP 1: Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Identity
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  mobile TEXT,
  id_number TEXT UNIQUE,
  
  -- Lifecycle Flags
  is_lead BOOLEAN DEFAULT true,
  is_applicant BOOLEAN DEFAULT false,
  is_member BOOLEAN DEFAULT false,
  is_rejected BOOLEAN DEFAULT false,
  
  -- Source Tracking
  source TEXT,
  landing_page_id UUID,
  campaign_id UUID,
  referrer_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- POPIA Compliance: Marketing Consent
  marketing_consent BOOLEAN DEFAULT false,
  marketing_consent_date TIMESTAMPTZ,
  marketing_consent_method TEXT,
  marketing_consent_ip TEXT,
  marketing_unsubscribed BOOLEAN DEFAULT false,
  marketing_unsubscribed_date TIMESTAMPTZ,
  
  -- Communication Preferences
  email_consent BOOLEAN DEFAULT true,
  sms_consent BOOLEAN DEFAULT false,
  phone_consent BOOLEAN DEFAULT false,
  
  -- Marketing Segmentation
  tags TEXT[],
  lead_score INTEGER DEFAULT 0,
  
  -- Lifecycle Timestamps
  lead_created_at TIMESTAMPTZ DEFAULT NOW(),
  application_submitted_at TIMESTAMPTZ,
  member_activated_at TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,
  
  -- POPIA: Data Subject Rights
  data_access_requested BOOLEAN DEFAULT false,
  data_access_requested_at TIMESTAMPTZ,
  data_deletion_requested BOOLEAN DEFAULT false,
  data_deletion_requested_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_mobile ON contacts(mobile);
CREATE INDEX IF NOT EXISTS idx_contacts_id_number ON contacts(id_number);
CREATE INDEX IF NOT EXISTS idx_contacts_is_lead ON contacts(is_lead) WHERE is_lead = true;
CREATE INDEX IF NOT EXISTS idx_contacts_is_applicant ON contacts(is_applicant) WHERE is_applicant = true;
CREATE INDEX IF NOT EXISTS idx_contacts_is_member ON contacts(is_member) WHERE is_member = true;
CREATE INDEX IF NOT EXISTS idx_contacts_is_rejected ON contacts(is_rejected) WHERE is_rejected = true;
CREATE INDEX IF NOT EXISTS idx_contacts_marketing_consent ON contacts(marketing_consent) WHERE marketing_consent = true;
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- STEP 2: Add contact_id to applications (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applications') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'contact_id') THEN
      ALTER TABLE applications ADD COLUMN contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_applications_contact_id ON applications(contact_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'marketing_consent') THEN
      ALTER TABLE applications ADD COLUMN marketing_consent BOOLEAN DEFAULT false;
      ALTER TABLE applications ADD COLUMN marketing_consent_date TIMESTAMPTZ;
    END IF;
  END IF;
END $$;

-- STEP 3: Add contact_id to members (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'members') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'members' AND column_name = 'contact_id') THEN
      ALTER TABLE members ADD COLUMN contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_members_contact_id ON members(contact_id);
    END IF;
  END IF;
END $$;

-- STEP 4: Create contact_interactions table
CREATE TABLE IF NOT EXISTS contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  
  interaction_type TEXT NOT NULL,
  channel TEXT,
  campaign_id UUID,
  
  subject TEXT,
  message TEXT,
  outcome TEXT,
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_interactions_contact_id ON contact_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_type ON contact_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_created_at ON contact_interactions(created_at DESC);

-- STEP 5: Create POPIA audit log
CREATE TABLE IF NOT EXISTS popia_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id),
  
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  
  performed_by UUID,
  ip_address TEXT,
  user_agent TEXT,
  
  details JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_popia_audit_log_contact_id ON popia_audit_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_popia_audit_log_action ON popia_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_popia_audit_log_created_at ON popia_audit_log(created_at DESC);

-- STEP 6: Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE popia_audit_log ENABLE ROW LEVEL SECURITY;

-- STEP 7: RLS Policies
CREATE POLICY "Anyone can create contacts" ON contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view contacts" ON contacts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update contacts" ON contacts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage interactions" ON contact_interactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view audit log" ON popia_audit_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert audit log" ON popia_audit_log
  FOR INSERT WITH CHECK (true);

-- STEP 8: Triggers
CREATE OR REPLACE FUNCTION update_contact_on_application_submit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contact_id IS NOT NULL THEN
    UPDATE contacts
    SET 
      is_applicant = true,
      application_submitted_at = NEW.submitted_at,
      updated_at = NOW()
    WHERE id = NEW.contact_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_contact_on_application_submit ON applications;
CREATE TRIGGER trigger_update_contact_on_application_submit
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_on_application_submit();

CREATE OR REPLACE FUNCTION update_contact_on_member_activation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contact_id IS NOT NULL THEN
    UPDATE contacts
    SET 
      is_member = true,
      member_activated_at = NEW.activated_at,
      updated_at = NOW()
    WHERE id = NEW.contact_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_contact_on_member_activation ON members;
CREATE TRIGGER trigger_update_contact_on_member_activation
  AFTER INSERT ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_on_member_activation();

CREATE OR REPLACE FUNCTION update_contact_on_application_rejection()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    IF NEW.contact_id IS NOT NULL THEN
      UPDATE contacts
      SET 
        is_rejected = true,
        updated_at = NOW()
      WHERE id = NEW.contact_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_contact_on_application_rejection ON applications;
CREATE TRIGGER trigger_update_contact_on_application_rejection
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_on_application_rejection();

-- STEP 9: Views
CREATE OR REPLACE VIEW marketing_contacts AS
SELECT 
  c.*,
  a.application_number,
  a.status as application_status,
  m.member_number,
  m.status as member_status
FROM contacts c
LEFT JOIN applications a ON c.id = a.contact_id
LEFT JOIN members m ON c.id = m.contact_id
WHERE 
  c.marketing_consent = true 
  AND c.marketing_unsubscribed = false
  AND c.data_deletion_requested = false;

CREATE OR REPLACE VIEW rejected_applicants AS
SELECT 
  c.*,
  a.application_number,
  a.rejection_reason,
  a.reviewed_at as rejection_date
FROM contacts c
INNER JOIN applications a ON c.id = a.contact_id
WHERE 
  c.is_rejected = true
  AND c.marketing_consent = true
  AND c.marketing_unsubscribed = false;

CREATE OR REPLACE VIEW active_members AS
SELECT 
  c.*,
  m.member_number,
  m.plan_name,
  m.monthly_premium,
  m.plan_start_date
FROM contacts c
INNER JOIN members m ON c.id = m.contact_id
WHERE 
  m.status = 'active'
  AND c.marketing_consent = true
  AND c.marketing_unsubscribed = false;

-- Comments
COMMENT ON TABLE contacts IS 'Master contact record for all leads, applicants, and members. POPIA compliant with consent tracking.';
COMMENT ON TABLE contact_interactions IS 'Marketing activity log. POPIA compliant audit trail of communications.';
COMMENT ON TABLE popia_audit_log IS 'POPIA compliance audit log. Tracks all data access and modifications.';
