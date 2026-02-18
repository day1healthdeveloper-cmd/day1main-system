-- Copy and paste this entire file into Supabase SQL Editor and click RUN

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read definitions" ON policy_definitions;
DROP POLICY IF EXISTS "Allow authenticated users to insert definitions" ON policy_definitions;
DROP POLICY IF EXISTS "Allow authenticated users to update definitions" ON policy_definitions;
DROP POLICY IF EXISTS "Allow authenticated users to delete definitions" ON policy_definitions;

-- Drop table if exists
DROP TABLE IF EXISTS policy_definitions;

-- Create Policy Definitions Table
CREATE TABLE policy_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  term VARCHAR(255) NOT NULL,
  definition TEXT NOT NULL,
  category VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_policy_definitions_product ON policy_definitions(product_id);
CREATE INDEX idx_policy_definitions_term ON policy_definitions(product_id, term);
CREATE INDEX idx_policy_definitions_order ON policy_definitions(product_id, display_order);

ALTER TABLE policy_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read definitions"
  ON policy_definitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert definitions"
  ON policy_definitions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update definitions"
  ON policy_definitions FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete definitions"
  ON policy_definitions FOR DELETE
  TO authenticated
  USING (true);
