-- =====================================================
-- UPDATE PROVIDERS TABLE TO MATCH EXCEL STRUCTURE
-- =====================================================

-- Add new columns to existing providers table
ALTER TABLE providers ADD COLUMN IF NOT EXISTS region VARCHAR(100);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS suburb VARCHAR(100);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS doctor_surname VARCHAR(255);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS prno VARCHAR(50); -- Practice number
ALTER TABLE providers ADD COLUMN IF NOT EXISTS tel VARCHAR(50);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS fax VARCHAR(50);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS disp_province VARCHAR(100); -- Dispensing province
ALTER TABLE providers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS profession VARCHAR(100); -- GP, Dentist, etc.

-- Update existing columns to match Excel (if they exist with different names)
-- The table already has: id, provider_num, name, type, practice_name, email, phone, status, created_at

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_providers_region ON providers(region);
CREATE INDEX IF NOT EXISTS idx_providers_suburb ON providers(suburb);
CREATE INDEX IF NOT EXISTS idx_providers_profession ON providers(profession);
CREATE INDEX IF NOT EXISTS idx_providers_is_active ON providers(is_active);
CREATE INDEX IF NOT EXISTS idx_providers_prno ON providers(prno);

-- Add comment to clarify column mapping
COMMENT ON COLUMN providers.provider_num IS 'Provider number - unique identifier';
COMMENT ON COLUMN providers.name IS 'Practice or provider name';
COMMENT ON COLUMN providers.doctor_surname IS 'Doctor surname from Excel';
COMMENT ON COLUMN providers.prno IS 'Practice number (PRNO from Excel)';
COMMENT ON COLUMN providers.tel IS 'Telephone number';
COMMENT ON COLUMN providers.disp_province IS 'Dispensing province';
COMMENT ON COLUMN providers.profession IS 'Profession: GP, Dentist, Specialist, etc.';
COMMENT ON COLUMN providers.is_active IS 'Active status from Excel';
