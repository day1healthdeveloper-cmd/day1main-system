-- Add Netcash tracking fields to debit_order_runs table

-- Add columns for Netcash API integration
ALTER TABLE debit_order_runs 
ADD COLUMN IF NOT EXISTS netcash_batch_reference VARCHAR(255),
ADD COLUMN IF NOT EXISTS netcash_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_status_check TIMESTAMP,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_debit_order_runs_netcash_ref 
ON debit_order_runs(netcash_batch_reference);

CREATE INDEX IF NOT EXISTS idx_debit_order_runs_status 
ON debit_order_runs(status);

-- Add comments
COMMENT ON COLUMN debit_order_runs.netcash_batch_reference IS 'Batch reference number from Netcash API';
COMMENT ON COLUMN debit_order_runs.netcash_status IS 'Current status from Netcash (Processing, Completed, Failed, etc.)';
COMMENT ON COLUMN debit_order_runs.submitted_at IS 'Timestamp when batch was submitted to Netcash';
COMMENT ON COLUMN debit_order_runs.last_status_check IS 'Last time we checked status with Netcash';
COMMENT ON COLUMN debit_order_runs.error_message IS 'Error message if submission or processing failed';
