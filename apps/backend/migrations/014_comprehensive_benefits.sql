-- ============================================================================
-- Comprehensive Benefits System - Tier 3: Detailed Benefit Information
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Benefit Plan Documents (Store original uploaded documents)
CREATE TABLE IF NOT EXISTS benefit_plan_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) DEFAULT 'benefit_schedule',
  version VARCHAR(50),
  upload_date TIMESTAMP DEFAULT NOW(),
  uploaded_by UUID,
  file_url TEXT,
  page_count INTEGER,
  full_text TEXT,
  ocr_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Benefit Detailed Information (Comprehensive benefit details)
CREATE TABLE IF NOT EXISTS benefit_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_benefit_id UUID REFERENCES product_benefits(id) ON DELETE CASCADE NOT NULL,
  
  -- Descriptions
  full_description TEXT,
  coverage_summary TEXT,
  member_guide_text TEXT,
  
  -- Inclusions (What IS covered)
  inclusions TEXT[],
  inclusion_notes TEXT,
  
  -- Exclusions (What is NOT covered)
  exclusions TEXT[],
  exclusion_notes TEXT,
  
  -- Conditions & Requirements
  conditions TEXT[],
  authorization_requirements TEXT,
  notification_requirements TEXT,
  
  -- Network & Provider Rules
  network_required BOOLEAN DEFAULT false,
  network_hospitals TEXT[],
  network_providers TEXT[],
  out_of_network_coverage_percentage DECIMAL(5,2),
  out_of_network_notes TEXT,
  
  -- Sub-limits (Multiple limits within benefit)
  sub_limits JSONB,
  
  -- Room & Accommodation
  room_type VARCHAR(100),
  room_upgrade_cost DECIMAL(15,2),
  room_notes TEXT,
  
  -- Procedure Codes
  icd10_codes TEXT[],
  tariff_codes TEXT[],
  procedure_codes TEXT[],
  
  -- Special Rules
  age_restrictions TEXT,
  frequency_limits TEXT,
  seasonal_restrictions TEXT,
  geographic_restrictions TEXT,
  
  -- Documentation
  required_documents TEXT[],
  claim_submission_notes TEXT,
  
  -- References
  policy_section_reference VARCHAR(100),
  document_page_reference VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(product_benefit_id)
);

-- Benefit Exclusions (Detailed exclusion tracking)
CREATE TABLE IF NOT EXISTS benefit_exclusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_benefit_id UUID REFERENCES product_benefits(id) ON DELETE CASCADE NOT NULL,
  exclusion_type VARCHAR(50) NOT NULL,
  exclusion_name VARCHAR(255) NOT NULL,
  exclusion_description TEXT,
  icd10_codes TEXT[],
  procedure_codes TEXT[],
  is_permanent BOOLEAN DEFAULT true,
  review_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Benefit Conditions (Specific conditions for benefit usage)
CREATE TABLE IF NOT EXISTS benefit_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_benefit_id UUID REFERENCES product_benefits(id) ON DELETE CASCADE NOT NULL,
  condition_type VARCHAR(50) NOT NULL,
  condition_name VARCHAR(255) NOT NULL,
  condition_description TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  applies_to VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Network Providers (Approved provider list per benefit)
CREATE TABLE IF NOT EXISTS benefit_network_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_benefit_id UUID REFERENCES product_benefits(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  provider_name VARCHAR(255) NOT NULL,
  provider_type VARCHAR(50),
  practice_number VARCHAR(50),
  location TEXT,
  contact_info JSONB,
  is_active BOOLEAN DEFAULT true,
  effective_date DATE,
  termination_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Procedure Code Mapping (Link benefits to specific procedures)
CREATE TABLE IF NOT EXISTS benefit_procedure_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_benefit_id UUID REFERENCES product_benefits(id) ON DELETE CASCADE NOT NULL,
  code_type VARCHAR(50) NOT NULL,
  code VARCHAR(50) NOT NULL,
  code_description TEXT,
  is_covered BOOLEAN DEFAULT true,
  coverage_percentage DECIMAL(5,2),
  max_amount DECIMAL(15,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_benefit_id, code_type, code)
);

-- Benefit Authorization Rules (Pre-auth requirements)
CREATE TABLE IF NOT EXISTS benefit_authorization_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_benefit_id UUID REFERENCES product_benefits(id) ON DELETE CASCADE NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  threshold_amount DECIMAL(15,2),
  threshold_quantity INTEGER,
  requires_preauth BOOLEAN DEFAULT true,
  requires_specialist_referral BOOLEAN DEFAULT false,
  requires_medical_motivation BOOLEAN DEFAULT false,
  turnaround_time_hours INTEGER,
  emergency_override BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Benefit Change History (Track all changes to benefits)
CREATE TABLE IF NOT EXISTS benefit_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_benefit_id UUID REFERENCES product_benefits(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID,
  change_type VARCHAR(50) NOT NULL,
  field_changed VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  effective_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_benefit_plan_documents_product ON benefit_plan_documents(product_id);
CREATE INDEX IF NOT EXISTS idx_benefit_plan_documents_active ON benefit_plan_documents(is_active);
CREATE INDEX IF NOT EXISTS idx_benefit_details_product_benefit ON benefit_details(product_benefit_id);
CREATE INDEX IF NOT EXISTS idx_benefit_exclusions_product_benefit ON benefit_exclusions(product_benefit_id);
CREATE INDEX IF NOT EXISTS idx_benefit_conditions_product_benefit ON benefit_conditions(product_benefit_id);
CREATE INDEX IF NOT EXISTS idx_benefit_network_providers_product_benefit ON benefit_network_providers(product_benefit_id);
CREATE INDEX IF NOT EXISTS idx_benefit_network_providers_provider ON benefit_network_providers(provider_id);
CREATE INDEX IF NOT EXISTS idx_benefit_procedure_codes_product_benefit ON benefit_procedure_codes(product_benefit_id);
CREATE INDEX IF NOT EXISTS idx_benefit_procedure_codes_code ON benefit_procedure_codes(code);
CREATE INDEX IF NOT EXISTS idx_benefit_authorization_rules_product_benefit ON benefit_authorization_rules(product_benefit_id);
CREATE INDEX IF NOT EXISTS idx_benefit_change_history_product_benefit ON benefit_change_history(product_benefit_id);

-- Full text search on benefit details
CREATE INDEX IF NOT EXISTS idx_benefit_details_full_description ON benefit_details USING gin(to_tsvector('english', full_description));
CREATE INDEX IF NOT EXISTS idx_benefit_plan_documents_full_text ON benefit_plan_documents USING gin(to_tsvector('english', full_text));

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Comprehensive Benefits tables created successfully!';
  RAISE NOTICE '📊 Created 8 new tables for detailed benefit management';
  RAISE NOTICE '🔍 Full-text search enabled on descriptions and documents';
END $$;
