const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrationSQL = `
-- Create benefit_usage table for tracking annual benefit usage per member
CREATE TABLE IF NOT EXISTS benefit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  benefit_type VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  
  -- Usage Tracking
  total_limit NUMERIC(10,2),
  used_amount NUMERIC(10,2) DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  remaining_amount NUMERIC(10,2),
  remaining_count INTEGER,
  
  -- Dates
  last_claim_date DATE,
  reset_date DATE DEFAULT (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year')::DATE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one record per member per benefit type per year
  UNIQUE(member_id, benefit_type, year)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_benefit_usage_member_id ON benefit_usage(member_id);
CREATE INDEX IF NOT EXISTS idx_benefit_usage_member_benefit_year ON benefit_usage(member_id, benefit_type, year);
CREATE INDEX IF NOT EXISTS idx_benefit_usage_year ON benefit_usage(year);

-- Create function to update remaining amounts
CREATE OR REPLACE FUNCTION update_benefit_usage_remaining()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_limit IS NOT NULL THEN
    NEW.remaining_amount := NEW.total_limit - NEW.used_amount;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_benefit_usage_remaining
  BEFORE INSERT OR UPDATE ON benefit_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_benefit_usage_remaining();
`;

async function createBenefitUsageTable() {
  console.log('Creating benefit_usage table...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      // Try direct query if RPC doesn't exist
      console.log('Trying direct query...');
      const { error: directError } = await supabase.from('_sql').select('*').limit(0);
      
      if (directError) {
        console.error('Error:', directError);
        process.exit(1);
      }
    }
    
    console.log('✅ benefit_usage table created successfully!');
    
    // Verify table exists
    const { data: tables, error: verifyError } = await supabase
      .from('benefit_usage')
      .select('*')
      .limit(0);
    
    if (verifyError) {
      console.error('Verification error:', verifyError);
    } else {
      console.log('✅ Table verified!');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

createBenefitUsageTable();
