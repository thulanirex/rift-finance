-- Extend invoice_status enum with new statuses
DO $$ BEGIN
  ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'submitted';
  ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'in_review';
  ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'approved';
  ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'funded';
  ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'repaid';
  ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'defaulted';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Extend invoices table with new fields
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS invoice_number text,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS buyer_name text,
ADD COLUMN IF NOT EXISTS buyer_country text,
ADD COLUMN IF NOT EXISTS buyer_vat text,
ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_by uuid,
ADD COLUMN IF NOT EXISTS minted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS mint_tx text,
ADD COLUMN IF NOT EXISTS cnft_leaf_id text,
ADD COLUMN IF NOT EXISTS cnft_collection text;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_org_status ON public.invoices(org_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_buyer_vat ON public.invoices(buyer_vat);

-- Create private storage bucket for invoice PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices-private', 'invoices-private', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for invoices-private bucket
CREATE POLICY "Sellers can upload own org invoices"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'invoices-private' AND
  auth.uid() IN (
    SELECT auth_id FROM public.users WHERE org_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can view own org invoices"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'invoices-private' AND
  (
    auth.uid() IN (
      SELECT auth_id FROM public.users WHERE org_id::text = (storage.foldername(name))[1]
    )
    OR
    auth.uid() IN (
      SELECT auth_id FROM public.users WHERE role IN ('operator', 'admin')
    )
  )
);