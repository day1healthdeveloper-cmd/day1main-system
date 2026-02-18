-- Policy Definitions Table
-- Stores individual definitions that can be referenced across the system

CREATE TABLE IF NOT EXISTS policy_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  term VARCHAR(255) NOT NULL,
  definition TEXT NOT NULL,
  category VARCHAR(100), -- e.g., 'medical', 'legal', 'general'
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_policy_definitions_product ON policy_definitions(product_id);
CREATE INDEX IF NOT EXISTS idx_policy_definitions_term ON policy_definitions(product_id, term);
CREATE INDEX IF NOT EXISTS idx_policy_definitions_order ON policy_definitions(product_id, display_order);

-- Add RLS policies
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

-- Seed initial definitions for Executive Hospital Plan
INSERT INTO policy_definitions (product_id, term, definition, category, display_order)
SELECT 
  id,
  'Accident or Accidental',
  'means a sudden unforeseen, unexpected, unusual, specific event, which is unintended, arises from a source external to the Insured, is independent of illness, disease or other bodily malfunction, which occurs at an identifiable time and place during the period of the Policy',
  'general',
  1
FROM products WHERE name = 'Executive Hospital Plan' LIMIT 1;

INSERT INTO policy_definitions (product_id, term, definition, category, display_order)
SELECT 
  id,
  'Accidental Permanent Total Disability',
  'means Permanent and total loss of or use of: Speech (100%), Hearing in both ears (100%), Any limb by physical separation at or above wrist or ankle (100%), One or both eyes (100%), Sight in one or both eyes (100%)',
  'medical',
  2
FROM products WHERE name = 'Executive Hospital Plan' LIMIT 1;

INSERT INTO policy_definitions (product_id, term, definition, category, display_order)
SELECT 
  id,
  'Admission',
  'means admission into a Hospital as an Inpatient, for a period of at least 24 (twenty-four) hours, on the advice or and under the professional care and attendance of a qualified physician',
  'medical',
  3
FROM products WHERE name = 'Executive Hospital Plan' LIMIT 1;

INSERT INTO policy_definitions (product_id, term, definition, category, display_order)
SELECT 
  id,
  'Hospital',
  'means an establishment which: holds a licence as a hospital or day clinic or nursing home; operates primarily for the reception, care and treatment of sick, ailing or injured persons as inpatients; provides organised facilities for diagnosis and surgical treatment; is not primarily a rest or convalescent home',
  'medical',
  4
FROM products WHERE name = 'Executive Hospital Plan' LIMIT 1;

INSERT INTO policy_definitions (product_id, term, definition, category, display_order)
SELECT 
  id,
  'Pre-Existing Condition',
  'means any Bodily Injury, Illness, Maternity or Critical Illness for which the Insured Person received medical advice, treatment, or whereby diagnosis or consultation has been provided in the 12 (twelve) months prior to the Inception Date',
  'medical',
  5
FROM products WHERE name = 'Executive Hospital Plan' LIMIT 1;
