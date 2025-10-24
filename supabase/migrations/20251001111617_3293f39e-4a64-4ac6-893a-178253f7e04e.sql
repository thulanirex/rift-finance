-- Stage 8: Payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  gross_amount numeric(18,2) NOT NULL,
  discount_rate_bps integer DEFAULT 200, -- basis points (200 = 2%)
  fees_eur numeric(18,2) DEFAULT 0,
  net_amount numeric(18,2) NOT NULL,
  status text DEFAULT 'queued' CHECK (status IN ('queued', 'paid', 'failed')),
  tx_sig text,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

-- Add payout columns to invoices
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS payout_id uuid REFERENCES payouts(id),
ADD COLUMN IF NOT EXISTS payout_status text DEFAULT 'na' CHECK (payout_status IN ('na', 'queued', 'paid', 'failed'));

-- Enable RLS on payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- RLS policies for payouts
CREATE POLICY "Orgs can view own payouts"
ON payouts FOR SELECT
USING (org_id = get_user_org_id() OR is_operator_or_admin());

CREATE POLICY "System can insert payouts"
ON payouts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Operators can manage payouts"
ON payouts FOR ALL
USING (is_operator_or_admin());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payouts_invoice ON payouts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payouts_org ON payouts(org_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- Stage 10: Insurance events table
CREATE TABLE IF NOT EXISTS insurance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  event text NOT NULL CHECK (event IN ('bind', 'claim_opened', 'claim_paid')),
  amount numeric(18,2),
  note text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on insurance_events
ALTER TABLE insurance_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for insurance_events
CREATE POLICY "Anyone can view insurance events"
ON insurance_events FOR SELECT
USING (true);

CREATE POLICY "Operators can manage insurance events"
ON insurance_events FOR ALL
USING (is_operator_or_admin());

CREATE INDEX IF NOT EXISTS idx_insurance_events_invoice ON insurance_events(invoice_id);

-- Stage 11: Privacy requests table
CREATE TABLE IF NOT EXISTS privacy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type text NOT NULL CHECK (request_type IN ('data_export', 'deletion')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  notes text
);

-- Enable RLS on privacy_requests
ALTER TABLE privacy_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for privacy_requests
CREATE POLICY "Users can view own requests"
ON privacy_requests FOR SELECT
USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR is_operator_or_admin());

CREATE POLICY "Users can create requests"
ON privacy_requests FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Operators can manage privacy requests"
ON privacy_requests FOR ALL
USING (is_operator_or_admin());

-- Create receipts storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for receipts
CREATE POLICY "Orgs can view own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  (name LIKE (get_user_org_id()::text || '/%') OR is_operator_or_admin())
);

CREATE POLICY "System can insert receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipts');