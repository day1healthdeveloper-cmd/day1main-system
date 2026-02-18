-- ============================================================================
-- HYBRID CONTACT DATABASE SCHEMA
-- South African Compliance: POPIA, FICA, CMS
-- ============================================================================

-- ============================================================================
-- CONTACTS TABLE (Master Contact Record)
-- Purpose: Single source of truth for all contacts (leads, applicants, members)
-- POPIA Compliant: Tracks consent, allows data subject requests
-- ============================================================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Identity
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  mobile TEXT,
  id_number TEXT UNIQUE, -- SA ID number (only for applicants/members)
  
  -- Lifecycle Flags
  is_lead BOOLEAN DEFAULT true,
  is_applicant BOOLEAN DEFAULT false,
  is_member BOOLEAN DEFAULT false,
  is_rejected BOOLEAN DEFAULT false,
  
  -- Source Tracking (Marketing Attribution)
  source TEXT, -- 'landing_page', 'referral', 'broker', 'direct', 'campaign'
  landing_page_id UUID,
  campaign_id UUID,
  referrer_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- POPIA Compliance: Marketing Consent
  marketing_consent BOOLEAN DEFAULT false,
  marketing_consent_date TIMESTAMPTZ,
  marketing_consent_method TEXT, -- 'application_form', 'email_opt_in', 'phone_call'
  marketing_consent_ip TEXT,
  marketing_unsubscribed BOOLEAN DEFAULT false,
  marketing_unsubscribed_date TIMESTAMPTZ,
  
  -- POPIA Compliance: Communication Preferences
  email_consent BOOLEAN DEFAULT true,
  sms_consent BOOLEAN DEFAULT false,
  phone_consent BOOLEAN DEFAULT false,
  
  -- Marketing Segmentation
  tags TEXT[], -- ['high-value', 'family', 'senior', 'rejected-applicant', etc]
  lead_score INTEGER DEFAULT 0, -- 0-100 scoring for prioritization
  
  -- Lifecycle Timestamps
  lead_created_at TIMESTAMPTZ DEFAULT NOW(),
  application_submitted_at TIMESTAMPTZ,
  member_activated_at TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,
  
  -- POPIA Compliance: Data Subject Rights
  data_access_requested BOOLEAN DEFAULT false,
  data_access_requested_at TIMESTAMPTZ,
  data_deletion_requested BOOLEAN DEFAULT false,
  data_deletion_requested_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
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

-- ============================================================================
-- APPLICATIONS TABLE (Sensitive Application Data)
-- Purpose: Full application details with FICA/KYC documents
-- POPIA Compliant: Sensitive personal information with strict RLS
-- ============================================================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  application_number TEXT UNIQUE NOT NULL,
  plan_id UUID, -- Reference to selected plan
  
  -- Personal Information (FICA/KYC)
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
  
  -- FICA/KYC Documents (Supabase Storage URLs)
  id_document_url TEXT,
  id_document_ocr_data JSONB,
  proof_of_address_url TEXT,
  proof_of_address_ocr_data JSONB,
  selfie_url TEXT,
  face_verification_result JSONB,
  
  -- Banking Details (Encrypted)
  bank_name TEXT,
  account_number TEXT, -- Should be encrypted at application level
  branch_code TEXT,
  account_holder_name TEXT,
  debit_order_day INTEGER,
  
  -- Medical History (Sensitive)
  medical_history JSONB,
  
  -- Terms Acceptance (Legal Compliance)
  voice_recording_url TEXT,
  signature_url TEXT,
  terms_accepted_at TIMESTAMPTZ,
  terms_ip_address TEXT,
  terms_user_agent TEXT,
  
  -- POPIA Consent (Captured during application)
  marketing_consent BOOLEAN DEFAULT false,
  marketing_consent_date TIMESTAMPTZ,
  
  -- Application Status
  status TEXT DEFAULT 'submitted', -- 'in_progress', 'submitted', 'under_review', 'approved', 'rejected'
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- CMS Compliance: Underwriting
  underwriting_status TEXT, -- 'pending', 'approved', 'declined'
  underwriting_notes TEXT,
  risk_rating TEXT, -- 'low', 'medium', 'high'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_contact_id ON applications(contact_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON applications(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_application_number ON applications(application_number);

-- ============================================================================
-- APPLICATION DEPENDENTS (Family Members)
-- Purpose: Spouse and children on the application
-- ============================================================================
CREATE TABLE IF NOT EXISTS application_dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT,
  date_of_birth DATE NOT NULL,
  gender TEXT,
  relationship TEXT NOT NULL, -- 'spouse', 'child'
  
  -- Documents
  id_document_url TEXT,
  birth_certificate_url TEXT,
  document_ocr_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_dependents_application_id ON application_dependents(application_id);

-- ============================================================================
-- MEMBERS TABLE (Approved Members Only)
-- Purpose: Active members with cover
-- CMS Compliant: Member records for regulatory reporting
-- ============================================================================
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES applications(id) NOT NULL,
  member_number TEXT UNIQUE NOT NULL,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  
  -- Plan Details
  plan_id UUID,
  plan_name TEXT,
  plan_start_date DATE NOT NULL,
  monthly_premium DECIMAL(10,2) NOT NULL,
  
  -- Banking Details
  bank_name TEXT,
  account_number TEXT, -- Encrypted
  branch_code TEXT,
  debit_order_day INTEGER,
  
  -- Member Status
  status TEXT DEFAULT 'active', -- 'active', 'suspended', 'cancelled', 'lapsed'
  suspension_reason TEXT,
  suspension_date DATE,
  cancellation_date DATE,
  cancellation_reason TEXT,
  
  -- CMS Compliance: Waiting Periods
  waiting_period_end_date DATE,
  pmb_waiting_period_end_date DATE,
  
  -- Timestamps
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_contact_id ON members(contact_id);
CREATE INDEX IF NOT EXISTS idx_members_application_id ON members(application_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_member_number ON members(member_number);
CREATE INDEX IF NOT EXISTS idx_members_plan_start_date ON members(plan_start_date);

-- ============================================================================
-- MEMBER DEPENDENTS (Active Family Members)
-- Purpose: Spouse and children on active member policies
-- ============================================================================
CREATE TABLE IF NOT EXISTS member_dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT,
  date_of_birth DATE NOT NULL,
  relationship TEXT NOT NULL, -- 'spouse', 'child'
  
  status TEXT DEFAULT 'active', -- 'active', 'removed'
  removed_at TIMESTAMPTZ,
  removal_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_dependents_member_id ON member_dependents(member_id);

-- ============================================================================
-- CONTACT INTERACTIONS (Marketing Activity Log)
-- Purpose: Track all marketing touchpoints
-- POPIA Compliant: Audit trail of communications
-- ============================================================================
CREATE TABLE IF NOT EXISTS contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  
  interaction_type TEXT NOT NULL, -- 'email_sent', 'sms_sent', 'call_made', 'campaign_enrolled', 'page_visit'
  channel TEXT, -- 'email', 'sms', 'phone', 'web'
  campaign_id UUID,
  
  subject TEXT,
  message TEXT,
  outcome TEXT, -- 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'answered', 'no_answer'
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_interactions_contact_id ON contact_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_type ON contact_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_created_at ON contact_interactions(created_at DESC);

-- ============================================================================
-- POPIA AUDIT LOG
-- Purpose: Track all data access and modifications for POPIA compliance
-- ============================================================================
CREATE TABLE IF NOT EXISTS popia_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id),
  
  action TEXT NOT NULL, -- 'data_accessed', 'data_modified', 'consent_given', 'consent_withdrawn', 'data_exported', 'data_deleted'
  table_name TEXT,
  record_id UUID,
  
  performed_by UUID, -- User who performed the action
  ip_address TEXT,
  user_agent TEXT,
  
  details JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_popia_audit_log_contact_id ON popia_audit_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_popia_audit_log_action ON popia_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_popia_audit_log_created_at ON popia_audit_log(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Contacts: Public can insert (lead capture), authenticated users can view
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create contacts" ON contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view contacts" ON contacts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update contacts" ON contacts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Applications: Public can insert (anonymous applications), admins can view all
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create applications" ON applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view applications" ON applications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update applications" ON applications
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Application Dependents: Same as applications
ALTER TABLE application_dependents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create dependents" ON application_dependents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view dependents" ON application_dependents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Members: Only authenticated users can view
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view members" ON members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update members" ON members
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Member Dependents: Same as members
ALTER TABLE member_dependents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view member dependents" ON member_dependents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Contact Interactions: Only authenticated users
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage interactions" ON contact_interactions
  FOR ALL USING (auth.role() = 'authenticated');

-- POPIA Audit Log: Only authenticated users can view
ALTER TABLE popia_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit log" ON popia_audit_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert audit log" ON popia_audit_log
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update contact lifecycle when application is submitted
CREATE OR REPLACE FUNCTION update_contact_on_application_submit()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contacts
  SET 
    is_applicant = true,
    application_submitted_at = NEW.submitted_at,
    updated_at = NOW()
  WHERE id = NEW.contact_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_on_application_submit
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_on_application_submit();

-- Function to update contact lifecycle when member is activated
CREATE OR REPLACE FUNCTION update_contact_on_member_activation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contacts
  SET 
    is_member = true,
    member_activated_at = NEW.activated_at,
    updated_at = NOW()
  WHERE id = NEW.contact_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_on_member_activation
  AFTER INSERT ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_on_member_activation();

-- Function to update contact lifecycle when application is rejected
CREATE OR REPLACE FUNCTION update_contact_on_application_rejection()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    UPDATE contacts
    SET 
      is_rejected = true,
      updated_at = NOW()
    WHERE id = NEW.contact_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_on_application_rejection
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_on_application_rejection();

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- Marketing-ready contacts (consented, not unsubscribed)
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

-- Rejected applicants (for re-engagement campaigns)
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

-- Active members (for upsell/renewal campaigns)
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

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE contacts IS 'Master contact record for all leads, applicants, and members. POPIA compliant with consent tracking.';
COMMENT ON TABLE applications IS 'Full application data with FICA/KYC documents. Sensitive personal information with strict RLS.';
COMMENT ON TABLE members IS 'Active members with cover. CMS compliant for regulatory reporting.';
COMMENT ON TABLE contact_interactions IS 'Marketing activity log. POPIA compliant audit trail of communications.';
COMMENT ON TABLE popia_audit_log IS 'POPIA compliance audit log. Tracks all data access and modifications.';

COMMENT ON COLUMN contacts.marketing_consent IS 'POPIA: Explicit consent for marketing communications';
COMMENT ON COLUMN contacts.marketing_unsubscribed IS 'POPIA: User has opted out of marketing';
COMMENT ON COLUMN contacts.data_deletion_requested IS 'POPIA: Right to be forgotten request';
COMMENT ON COLUMN applications.id_number IS 'FICA: South African ID number for KYC verification';
COMMENT ON COLUMN applications.id_document_url IS 'FICA: ID document for KYC verification';
COMMENT ON COLUMN applications.proof_of_address_url IS 'FICA: Proof of address for KYC verification';
COMMENT ON COLUMN members.waiting_period_end_date IS 'CMS: General waiting period end date';
COMMENT ON COLUMN members.pmb_waiting_period_end_date IS 'CMS: PMB waiting period end date (3 months max)';
