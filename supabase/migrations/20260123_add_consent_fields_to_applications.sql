-- Migration: Add missing fields to applications table
-- Created: 2026-01-23
-- Description: Adds email_consent, sms_consent, phone_consent, plan_name, plan_config, monthly_price

-- Add consent fields
ALTER TABLE applications ADD COLUMN IF NOT EXISTS email_consent BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS phone_consent BOOLEAN DEFAULT false;

-- Add plan fields
ALTER TABLE applications ADD COLUMN IF NOT EXISTS plan_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS plan_config TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS monthly_price NUMERIC(10,2);
