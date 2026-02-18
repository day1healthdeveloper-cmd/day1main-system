-- Policy Document Sections Table
-- Stores the complete policy document organized by sections

CREATE TABLE IF NOT EXISTS policy_document_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  section_id VARCHAR(100) NOT NULL,
  section_title VARCHAR(255) NOT NULL,
  section_order INTEGER NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, section_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_policy_sections_product ON policy_document_sections(product_id);
CREATE INDEX IF NOT EXISTS idx_policy_sections_order ON policy_document_sections(product_id, section_order);

-- Add RLS policies
ALTER TABLE policy_document_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read policy sections"
  ON policy_document_sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert policy sections"
  ON policy_document_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update policy sections"
  ON policy_document_sections FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete policy sections"
  ON policy_document_sections FOR DELETE
  TO authenticated
  USING (true);
