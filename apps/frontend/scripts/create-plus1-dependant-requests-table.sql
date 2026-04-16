-- Plus1 Dependant Requests Table
-- Stores Plus1Rewards member dependant addition requests with verification workflow

CREATE TABLE IF NOT EXISTS plus1_dependant_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  mobile_number TEXT NOT NULL,
  member_first_name TEXT,
  member_last_name TEXT,
  member_email TEXT,
  
  -- Dependant Information
  dependant_first_name TEXT NOT NULL,
  dependant_last_name TEXT NOT NULL,
  dependant_id_number TEXT NOT NULL,
  dependant_date_of_birth DATE NOT NULL,
  dependant_gender TEXT NOT NULL,
  dependant_relationship TEXT NOT NULL, -- spouse, partner, child
  
  -- Documents
  id_document_url TEXT,
  birth_certificate_url TEXT,
  marriage_certificate_url TEXT,
  
  -- Premium Information
  current_premium DECIMAL(10,2) NOT NULL,
  dependant_cost DECIMAL(10,2) NOT NULL,
  new_premium DECIMAL(10,2) NOT NULL,
  
  -- Status and Workflow
  status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, approved, rejected
  verification_notes TEXT,
  call_recording_url TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  rejected_by UUID REFERENCES users(id),
  rejected_at TIMESTAMP,
  
  -- Timestamps
  requested_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_plus1_dependant_requests_mobile ON plus1_dependant_requests(mobile_number);
CREATE INDEX IF NOT EXISTS idx_plus1_dependant_requests_status ON plus1_dependant_requests(status);
CREATE INDEX IF NOT EXISTS idx_plus1_dependant_requests_member_id ON plus1_dependant_requests(member_id);

-- Add comment
COMMENT ON TABLE plus1_dependant_requests IS 'Stores Plus1Rewards member dependant addition requests with verification workflow';
