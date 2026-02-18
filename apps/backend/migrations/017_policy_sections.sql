-- Policy Sections Table
-- Stores content for each policy section (Waiting Periods, General Provisions, etc.)

CREATE TABLE IF NOT EXISTS policy_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  section_type VARCHAR(100) NOT NULL, -- 'waiting-periods', 'general-provisions', etc.
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, section_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_policy_sections_product ON policy_sections(product_id);
CREATE INDEX IF NOT EXISTS idx_policy_sections_type ON policy_sections(product_id, section_type);

-- Add RLS policies
ALTER TABLE policy_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read sections"
  ON policy_sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert sections"
  ON policy_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update sections"
  ON policy_sections FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete sections"
  ON policy_sections FOR DELETE
  TO authenticated
  USING (true);

-- Policy Section Items Table
-- For sections that have multiple items (like waiting periods list, exclusions list, etc.)

CREATE TABLE IF NOT EXISTS policy_section_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  section_type VARCHAR(100) NOT NULL, -- 'waiting-periods', 'exclusions-limitations', etc.
  title VARCHAR(255),
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_policy_section_items_product ON policy_section_items(product_id);
CREATE INDEX IF NOT EXISTS idx_policy_section_items_type ON policy_section_items(product_id, section_type);
CREATE INDEX IF NOT EXISTS idx_policy_section_items_order ON policy_section_items(product_id, section_type, display_order);

-- Add RLS policies
ALTER TABLE policy_section_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read section items"
  ON policy_section_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert section items"
  ON policy_section_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update section items"
  ON policy_section_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete section items"
  ON policy_section_items FOR DELETE
  TO authenticated
  USING (true);
