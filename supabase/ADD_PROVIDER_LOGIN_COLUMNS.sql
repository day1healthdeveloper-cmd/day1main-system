-- Add login credentials columns to providers table
ALTER TABLE providers
ADD COLUMN IF NOT EXISTS login_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS login_password VARCHAR(255);

-- Add unique constraint for login email
CREATE UNIQUE INDEX IF NOT EXISTS idx_providers_login_email_unique ON providers(login_email) WHERE login_email IS NOT NULL;

COMMENT ON COLUMN providers.login_email IS 'Provider login email address';
COMMENT ON COLUMN providers.login_password IS 'Provider login password (stored for admin reference)';
