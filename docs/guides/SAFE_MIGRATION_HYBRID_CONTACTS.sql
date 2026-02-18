-- ============================================================================
-- SAFE MIGRATION: Hybrid Contact Database
-- Works with existing: members, landing_page_leads, landing_pages
-- Creates new: contacts, applications, application_dependents
-- ============================================================================

-- STEP 1: Create contacts table (master contact record)
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
  landing_page_id UUID REFERENCES landing_pages(id),
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

-- Indexes for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_mobile ON contacts(mobile);
CREATE INDEX IF NOT EXISTS idx_contacts_id_number ON contacts(id_number);
CREATE INDEX IF NOT EXISTS idx_contacts_is_lead ON contacts(is_lead) WHERE is_lead = true;
CREATE INDEX IF NOT EXISTS idx_contacts_is_applicant ON contacts(is_applicant) WHERE is_applicant = true;
CREATE INDEX IF NOT EXISTS idx_contacts_is_member ON contacts(is_member) WHERE is_member = true;
CREATE INDEX IF NOT EXISTS idx_contacts_marketing_consent ON contacts(marketing_consent) WHERE marketing_consent = true;
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- STEP 2: Migrate existing landing_page_leads to contacts
INSERT INTO contacts (
  email, first_name, last_name, mobile, 
  is_lead, source, landing_page_id, 
  lead_created_at, created_at, metadata
)
SELECT 
  email, 
  first_name, 
  COALESCE(last_name, ''), 
  phone,
  true,
  'landing_page',
  landing_page_id,
  created_at,
  created_at,
  COALESCE(metadata, '{}'::jsonb)
FROM landing_page_leads
WHERE email NOT IN (SELECT email FROM contacts)
ON CONFLICT (email) DO NOTHING;

-- STEP 3: Migrate existing members to contacts
INSERT INTO contacts (
  email, first_name, last_name, mobile, id_number,
  is_member, source,
  member_activated_at, created_at
)
SELECT 
  COALESCE(email, member_number || '@placeholder.com'),
  first_name,
  last_name,
  phone,
  id_number,
  true,
  'direct',
  created_at,
  created_at
FROM members
WHERE COALESCE(email, member_number || '@placeholder.com') NOT IN (SELECT email FROM contacts)
ON CONFLICT (email) DO NOTHING;

-- STEP 4: Add contact_id to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id);
CREATE INDEX IF NOT EXISTS idx_members_contact_id ON members(contact_id);

-- STEP 5: Link existing members to contacts
UPDATE members m
SET contact_id = c.id
FROM contacts c
WHERE m.email = c.email
  AND m.contact_id IS NULL;

-- STEP 6: Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  application_number TEXT UNIQUE NOT NULL,
  plan_id UUID,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  
  -- FICA/KYC Documents
  id_document_url TEXT,
  id_document_ocr_data JSONB,
  proof_of_address_url TEXT,
  proof_of_address_ocr_data JSONB,
  selfie_url TEXT,
  face_verification_result JSONB,
  
  -- Banking Details
  bank_name TEXT,
  account_number TEXT,
  branch_code TEXT,
  account_holder_name TEXT,
  debit_order_day INTEGER,
  
  -- Medical History
  medical_history JSONB,
  
  -- Terms Acceptance
  voice_recording_url TEXT,
  signature_url TEXT,
  terms_accepted_at TIMESTAMPTZ,
  terms_ip_address TEXT,
  terms_user_agent TEXT,
  
  -- POPIA: Marketing Consent
  marketing_consent BOOLEAN DEFAULT false,
  marketing_consent_date TIMESTAMPTZ,
  
  -- Application Status
  status TEXT DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- CMS Compliance
  underwriting_status TEXT,
  underwriting_notes TEXT,
  risk_rating TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_contact_id ON applications(contact_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON applications(submitted_at DESC);

-- STEP 7: Create application_dependents table
CREATE TABLE IF NOT EXISTS application_dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT,
  date_of_birth DATE NOT NULL,
  gender TEXT,
  relationship TEXT NOT NULL,
  
  id_document_url TEXT,
  birth_certificate_url TEXT,
  document_ocr_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_dependents_application_id ON application_dependents(application_id);

-- STEP 8: Create contact_interactions table
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
CREATE INDEX IF NOT EXISTS idx_contact_interactions_created_at ON contact_interactions(created_at DESC);

-- STEP 9: Create POPIA audit log
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
CREATE INDEX IF NOT EXISTS idx_popia_audit_log_created_at ON popia_audit_log(created_at DESC);

-- STEP 10: Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE popia_audit_log ENABLE ROW LEVEL SECURITY;

-- STEP 11: Create RLS policies
CREATE POLICY "Anyone can create contacts" ON contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view contacts" ON contacts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update contacts" ON contacts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can create applications" ON applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view applications" ON applications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update applications" ON applications
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can create dependents" ON application_dependents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view dependents" ON application_dependents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage interactions" ON contact_interactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view audit log" ON popia_audit_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert audit log" ON popia_audit_log
  FOR INSERT WITH CHECK (true);

-- STEP 12: Create triggers
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
      member_activated_at = NEW.created_at,
      updated_at = NOW()
    WHERE id = NEW.contact_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_contact_on_member_activation ON members;
CREATE TRIGGER trigger_update_contact_on_member_activation
  AFTER INSERT OR UPDATE ON members
  FOR EACH ROW
  WHEN (NEW.contact_id IS NOT NULL)
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

-- STEP 13: Create views
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
  m.status as member_status
FROM contacts c
INNER JOIN members m ON c.id = m.contact_id
WHERE 
  m.status = 'active'
  AND c.marketing_consent = true
  AND c.marketing_unsubscribed = false;

-- STEP 14: Add comments
COMMENT ON TABLE contacts IS 'Master contact record for all leads, applicants, and members. POPIA compliant.';
COMMENT ON TABLE applications IS 'Full application data with FICA/KYC documents. Sensitive information.';
COMMENT ON TABLE contact_interactions IS 'Marketing activity log. POPIA compliant audit trail.';
COMMENT ON TABLE popia_audit_log IS 'POPIA compliance audit log.';

-- Migration complete!
SELECT 'SAFE MIGRATION COMPLETED - Hybrid Contact Database Created' as status;
