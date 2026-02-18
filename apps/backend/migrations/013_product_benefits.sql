-- ============================================================================
-- Product Benefits System
-- Purpose: Configure benefits, limits, and rules for medical scheme products
-- ============================================================================

-- Benefit Types (Master list of all possible benefits)
CREATE TABLE IF NOT EXISTS benefit_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'hospital', 'day_to_day', 'chronic', 'pmb', 'other'
  description TEXT,
  requires_preauth BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Benefits (Links products to benefits with specific configurations)
CREATE TABLE IF NOT EXISTS product_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  benefit_type_id UUID REFERENCES benefit_types(id) ON DELETE CASCADE NOT NULL,
  
  -- Coverage details
  is_covered BOOLEAN DEFAULT true,
  coverage_type VARCHAR(50) DEFAULT 'unlimited', -- 'unlimited', 'capped', 'percentage', 'excluded'
  annual_limit DECIMAL(15,2), -- Annual limit in Rands (NULL = unlimited)
  sub_limit DECIMAL(15,2), -- Sub-limit per event/visit
  
  -- Co-payment rules
  copayment_type VARCHAR(50), -- 'none', 'fixed', 'percentage'
  copayment_amount DECIMAL(15,2), -- Fixed amount or percentage
  
  -- Waiting periods
  waiting_period_days INTEGER DEFAULT 0,
  waiting_period_months INTEGER DEFAULT 0,
  
  -- Network restrictions
  network_only BOOLEAN DEFAULT false,
  network_discount_percentage DECIMAL(5,2), -- Discount if using network providers
  
  -- Authorization
  requires_preauth BOOLEAN DEFAULT false,
  preauth_threshold DECIMAL(15,2), -- Amount above which preauth is required
  
  -- Additional rules
  exclusions TEXT[], -- Array of exclusion conditions
  conditions TEXT, -- Special conditions or notes
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(product_id, benefit_type_id)
);

-- Benefit Limits (Track usage against limits)
CREATE TABLE IF NOT EXISTS benefit_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  product_benefit_id UUID REFERENCES product_benefits(id) ON DELETE CASCADE NOT NULL,
  
  -- Period tracking
  benefit_year INTEGER NOT NULL, -- Year for annual limits
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Usage tracking
  amount_used DECIMAL(15,2) DEFAULT 0,
  amount_remaining DECIMAL(15,2),
  claims_count INTEGER DEFAULT 0,
  
  -- Status
  is_exhausted BOOLEAN DEFAULT false,
  last_claim_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(member_id, product_benefit_id, benefit_year)
);

-- PMB (Prescribed Minimum Benefits) Conditions
CREATE TABLE IF NOT EXISTS pmb_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'diagnosis', 'treatment', 'emergency'
  icd10_codes TEXT[], -- Array of ICD-10 codes
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chronic Disease List (CDL)
CREATE TABLE IF NOT EXISTS chronic_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  icd10_codes TEXT[], -- Array of ICD-10 codes
  medication_list TEXT[], -- Array of approved medications
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Chronic Benefits (Link products to chronic conditions)
CREATE TABLE IF NOT EXISTS product_chronic_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  chronic_condition_id UUID REFERENCES chronic_conditions(id) ON DELETE CASCADE NOT NULL,
  annual_limit DECIMAL(15,2), -- Annual limit for this chronic condition
  requires_registration BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(product_id, chronic_condition_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_benefits_product ON product_benefits(product_id);
CREATE INDEX IF NOT EXISTS idx_product_benefits_benefit_type ON product_benefits(benefit_type_id);
CREATE INDEX IF NOT EXISTS idx_benefit_usage_member ON benefit_usage(member_id);
CREATE INDEX IF NOT EXISTS idx_benefit_usage_year ON benefit_usage(benefit_year);
CREATE INDEX IF NOT EXISTS idx_product_chronic_product ON product_chronic_benefits(product_id);

-- Comments
COMMENT ON TABLE benefit_types IS 'Master list of all benefit types available in the system';
COMMENT ON TABLE product_benefits IS 'Configuration of benefits for each product with limits and rules';
COMMENT ON TABLE benefit_usage IS 'Tracks member usage of benefits against annual limits';
COMMENT ON TABLE pmb_conditions IS 'Prescribed Minimum Benefits as per CMS regulations';
COMMENT ON TABLE chronic_conditions IS 'Chronic Disease List (CDL) conditions';
COMMENT ON TABLE product_chronic_benefits IS 'Chronic medication benefits per product';
