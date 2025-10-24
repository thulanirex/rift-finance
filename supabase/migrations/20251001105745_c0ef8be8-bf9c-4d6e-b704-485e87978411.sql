-- Add missing columns to pools table
ALTER TABLE pools 
ADD COLUMN IF NOT EXISTS tvl numeric(18,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_liquidity numeric(18,2) DEFAULT 0;

-- Update existing column name if needed (total_liquidity -> tvl mapping)
UPDATE pools SET tvl = total_liquidity WHERE tvl = 0;

-- Add missing columns to positions table
ALTER TABLE positions
ADD COLUMN IF NOT EXISTS opened_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS closed_at timestamptz,
ADD COLUMN IF NOT EXISTS chain_tx text;

-- Add indexes for positions
CREATE INDEX IF NOT EXISTS idx_positions_funder_status ON positions(funder_user_id, status);
CREATE INDEX IF NOT EXISTS idx_positions_pool_status ON positions(pool_id, status);

-- Add missing columns to ledger_entries
ALTER TABLE ledger_entries
ADD COLUMN IF NOT EXISTS tx_sig text,
ADD COLUMN IF NOT EXISTS chain_slot bigint,
ADD COLUMN IF NOT EXISTS notes text;

-- Create pool_snapshots table
CREATE TABLE IF NOT EXISTS pool_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  tvl numeric(18,2) NOT NULL,
  available_liquidity numeric(18,2) NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Add index for pool_snapshots
CREATE INDEX IF NOT EXISTS idx_pool_snapshots_pool_timestamp ON pool_snapshots(pool_id, timestamp DESC);

-- Enable RLS on pool_snapshots
ALTER TABLE pool_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS policies for pool_snapshots (public read, system write)
CREATE POLICY "Anyone can view pool snapshots"
ON pool_snapshots FOR SELECT
USING (true);

CREATE POLICY "System can insert snapshots"
ON pool_snapshots FOR INSERT
WITH CHECK (true);

-- Seed the three pools with APRs (using UPSERT to avoid duplicates)
INSERT INTO pools (tenor_days, apr, tvl, available_liquidity)
VALUES 
  (30, 0.05, 0, 0),
  (90, 0.07, 0, 0),
  (120, 0.10, 0, 0)
ON CONFLICT (tenor_days) 
DO UPDATE SET 
  apr = EXCLUDED.apr,
  tvl = pools.tvl,
  available_liquidity = pools.available_liquidity;