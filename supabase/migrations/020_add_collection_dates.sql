-- Add collection_dates column to payment_groups table
-- This will store 12 collection dates (one per month) as a JSON array
ALTER TABLE payment_groups
ADD COLUMN collection_dates JSONB DEFAULT '[]'::jsonb;

-- Add a comment to explain the column
COMMENT ON COLUMN payment_groups.collection_dates IS 'Array of 12 collection dates for the year (one per month) in ISO format. Used for Group Debit Order scheduling.';

-- Example data structure: ["2026-01-15", "2026-02-15", "2026-03-15", ...]
