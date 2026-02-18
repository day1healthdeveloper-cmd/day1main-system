-- Add missing fields to members table to store complete application data
-- Migration: 008_add_member_fields.sql

-- Add address fields
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255),
ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);

-- Add plan fields
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS plan_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS plan_config VARCHAR(50),
ADD COLUMN IF NOT EXISTS monthly_premium DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;

-- Add banking fields
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS account_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS branch_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS debit_order_day INTEGER;

-- Add mobile field (separate from phone)
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);

-- Add comments
COMMENT ON COLUMN public.members.address_line1 IS 'Primary address line';
COMMENT ON COLUMN public.members.address_line2 IS 'Secondary address line';
COMMENT ON COLUMN public.members.city IS 'City';
COMMENT ON COLUMN public.members.postal_code IS 'Postal/ZIP code';
COMMENT ON COLUMN public.members.plan_name IS 'Selected insurance plan name';
COMMENT ON COLUMN public.members.plan_config IS 'Plan configuration (single, couple, family)';
COMMENT ON COLUMN public.members.monthly_premium IS 'Monthly premium amount';
COMMENT ON COLUMN public.members.start_date IS 'Membership start date';
COMMENT ON COLUMN public.members.bank_name IS 'Bank name for debit order';
COMMENT ON COLUMN public.members.account_number IS 'Bank account number';
COMMENT ON COLUMN public.members.branch_code IS 'Bank branch code';
COMMENT ON COLUMN public.members.account_holder_name IS 'Account holder name';
COMMENT ON COLUMN public.members.debit_order_day IS 'Day of month for debit order (1-31)';
COMMENT ON COLUMN public.members.mobile IS 'Mobile phone number';
