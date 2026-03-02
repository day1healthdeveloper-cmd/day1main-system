-- Add user_id column to providers table to link providers to user accounts
ALTER TABLE providers
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN login_email VARCHAR(255),
ADD COLUMN login_password VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX idx_providers_user_id ON providers(user_id);

-- Add unique constraint to ensure one provider per user
CREATE UNIQUE INDEX idx_providers_user_id_unique ON providers(user_id) WHERE user_id IS NOT NULL;

-- Add unique constraint for login email
CREATE UNIQUE INDEX idx_providers_login_email_unique ON providers(login_email) WHERE login_email IS NOT NULL;

COMMENT ON COLUMN providers.user_id IS 'Links provider to their user account for authentication';
COMMENT ON COLUMN providers.login_email IS 'Provider login email address';
COMMENT ON COLUMN providers.login_password IS 'Provider login password (stored for admin reference)';
