-- Add Netcash group ID to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS netcash_group_id INT;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_members_netcash_group ON members(netcash_group_id);

-- Add comment
COMMENT ON COLUMN members.netcash_group_id IS 'Netcash master file group ID (assigned by Netcash dashboard)';

-- Create netcash_groups mapping table
CREATE TABLE IF NOT EXISTS netcash_groups (
  id SERIAL PRIMARY KEY,
  broker_group VARCHAR(10) UNIQUE NOT NULL,
  netcash_group_id INT UNIQUE NOT NULL,
  group_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE netcash_groups IS 'Mapping between Day1Health broker groups and Netcash master file groups';
COMMENT ON COLUMN netcash_groups.broker_group IS 'Day1Health broker code (DAY1, D1PAR, etc.)';
COMMENT ON COLUMN netcash_groups.netcash_group_id IS 'Netcash master file group ID';

-- Insert placeholder mappings (update with actual Netcash group IDs after creation)
INSERT INTO netcash_groups (broker_group, netcash_group_id, group_name, description) VALUES
  ('DAY1', 1, 'Day1Health Direct', 'Direct members - no broker'),
  ('D1PAR', 2, 'Parabellum', 'Parabellum broker channel'),
  ('D1MAM', 3, 'Mamela', 'Mamela broker channel'),
  ('D1ACU', 4, 'Acumen Holdings', 'Acumen Holdings broker channel'),
  ('D1AIB', 5, 'Assurity Insurance Broker', 'Assurity Insurance Broker channel'),
  ('D1ARC', 6, 'ARC BPO', 'ARC BPO broker channel'),
  ('D1AXS', 7, 'Accsure', 'Accsure broker channel'),
  ('D1BOU', 8, 'Boulderson', 'Boulderson broker channel'),
  ('D1BPO', 9, 'Agency BPO', 'Agency BPO broker channel'),
  ('D1CSS', 10, 'CSS Credit Solutions', 'CSS Credit Solutions broker channel'),
  ('D1MED', 11, 'Medi-Safu Brokers', 'Medi-Safu Brokers channel'),
  ('D1MEM', 12, 'Medi-Safu Montana', 'Medi-Safu Montana broker channel'),
  ('D1MKT', 13, 'MKT Marketing', 'MKT Marketing broker channel'),
  ('D1MTS', 14, 'All My T', 'All My T broker channel'),
  ('D1NAV', 15, 'Day1 Navigator', 'Day1 Navigator broker channel'),
  ('D1RCO', 16, 'Right Cover Online', 'Right Cover Online broker channel'),
  ('D1TFG', 17, 'The Foschini Group', 'The Foschini Group broker channel'),
  ('D1THR', 18, '360 Financial Service', '360 Financial Service broker channel'),
  ('D1TLD', 19, 'Teledirect', 'Teledirect broker channel')
ON CONFLICT (broker_group) DO NOTHING;

-- Update members with netcash_group_id based on broker_group
UPDATE members m
SET netcash_group_id = ng.netcash_group_id
FROM netcash_groups ng
WHERE m.broker_group = ng.broker_group
  AND m.netcash_group_id IS NULL;
