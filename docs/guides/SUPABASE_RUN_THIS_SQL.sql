-- ============================================================================
-- Product Benefits System - Run this in Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- Copy and paste this entire file, then click "Run"
-- ============================================================================

-- Benefit Types (Master list of all possible benefits)
CREATE TABLE IF NOT EXISTS benefit_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  requires_preauth BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Benefits
CREATE TABLE IF NOT EXISTS product_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  benefit_type_id UUID REFERENCES benefit_types(id) ON DELETE CASCADE NOT NULL,
  is_covered BOOLEAN DEFAULT true,
  coverage_type VARCHAR(50) DEFAULT 'unlimited',
  annual_limit DECIMAL(15,2),
  sub_limit DECIMAL(15,2),
  copayment_type VARCHAR(50),
  copayment_amount DECIMAL(15,2),
  waiting_period_days INTEGER DEFAULT 0,
  waiting_period_months INTEGER DEFAULT 0,
  network_only BOOLEAN DEFAULT false,
  network_discount_percentage DECIMAL(5,2),
  requires_preauth BOOLEAN DEFAULT false,
  preauth_threshold DECIMAL(15,2),
  exclusions TEXT[],
  conditions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, benefit_type_id)
);

-- Benefit Usage Tracking
CREATE TABLE IF NOT EXISTS benefit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  product_benefit_id UUID REFERENCES product_benefits(id) ON DELETE CASCADE NOT NULL,
  benefit_year INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount_used DECIMAL(15,2) DEFAULT 0,
  amount_remaining DECIMAL(15,2),
  claims_count INTEGER DEFAULT 0,
  is_exhausted BOOLEAN DEFAULT false,
  last_claim_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(member_id, product_benefit_id, benefit_year)
);

-- PMB Conditions
CREATE TABLE IF NOT EXISTS pmb_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  icd10_codes TEXT[],
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chronic Conditions
CREATE TABLE IF NOT EXISTS chronic_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  icd10_codes TEXT[],
  medication_list TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Chronic Benefits
CREATE TABLE IF NOT EXISTS product_chronic_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  chronic_condition_id UUID REFERENCES chronic_conditions(id) ON DELETE CASCADE NOT NULL,
  annual_limit DECIMAL(15,2),
  requires_registration BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, chronic_condition_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_benefits_product ON product_benefits(product_id);
CREATE INDEX IF NOT EXISTS idx_product_benefits_benefit_type ON product_benefits(benefit_type_id);
CREATE INDEX IF NOT EXISTS idx_benefit_usage_member ON benefit_usage(member_id);
CREATE INDEX IF NOT EXISTS idx_benefit_usage_year ON benefit_usage(benefit_year);
CREATE INDEX IF NOT EXISTS idx_product_chronic_product ON product_chronic_benefits(product_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Product Benefits tables created successfully!';
END $$;
