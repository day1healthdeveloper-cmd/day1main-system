-- Migration: Add ALL application fields to members table
-- This ensures members table is an exact copy of approved applications

-- Add document URLs
ALTER TABLE members ADD COLUMN IF NOT EXISTS id_document_url TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS id_document_ocr_data JSONB;
ALTER TABLE members ADD COLUMN IF NOT EXISTS proof_of_address_url TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS proof_of_address_ocr_data JSONB;
ALTER TABLE members ADD COLUMN IF NOT EXISTS selfie_url TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS face_verification_result JSONB;

-- Add medical history
ALTER TABLE members ADD COLUMN IF NOT EXISTS medical_history JSONB;

-- Add voice recording and signature
ALTER TABLE members ADD COLUMN IF NOT EXISTS voice_recording_url TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS signature_url TEXT;

-- Add terms acceptance tracking
ALTER TABLE members ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS terms_ip_address TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS terms_user_agent TEXT;

-- Add marketing consent fields
ALTER TABLE members ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;
ALTER TABLE members ADD COLUMN IF NOT EXISTS marketing_consent_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS email_consent BOOLEAN DEFAULT false;
ALTER TABLE members ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN DEFAULT false;
ALTER TABLE members ADD COLUMN IF NOT EXISTS phone_consent BOOLEAN DEFAULT false;

-- Add plan ID
ALTER TABLE members ADD COLUMN IF NOT EXISTS plan_id TEXT;

-- Add application tracking
ALTER TABLE members ADD COLUMN IF NOT EXISTS application_id UUID;
ALTER TABLE members ADD COLUMN IF NOT EXISTS application_number TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS approved_by UUID;

-- Add underwriting fields
ALTER TABLE members ADD COLUMN IF NOT EXISTS underwriting_status TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS underwriting_notes TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS risk_rating TEXT;

-- Add review fields
ALTER TABLE members ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- Create index on application_id for quick lookups
CREATE INDEX IF NOT EXISTS idx_members_application_id ON members(application_id);
CREATE INDEX IF NOT EXISTS idx_members_application_number ON members(application_number);

-- Add comment
COMMENT ON TABLE members IS 'Members table - contains complete copy of approved applications including all documents, voice recordings, signatures, and consent data';
