-- Create enum for entity type
DO $$ BEGIN
  CREATE TYPE entity_type_enum AS ENUM ('invoice', 'organization');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create rift_scores table
CREATE TABLE public.rift_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type entity_type_enum NOT NULL,
  entity_id UUID NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  grade rift_grade NOT NULL,
  breakdown JSONB NOT NULL,
  inputs_snapshot JSONB NOT NULL,
  calc_context JSONB,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id, version)
);

-- Create index for faster lookups
CREATE INDEX idx_rift_scores_entity ON public.rift_scores(entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.rift_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for rift_scores
CREATE POLICY "Users can view org scores" ON public.rift_scores
  FOR SELECT
  USING (
    (entity_type = 'organization' AND entity_id = get_user_org_id()) OR
    (entity_type = 'invoice' AND entity_id IN (
      SELECT id FROM invoices WHERE org_id = get_user_org_id()
    )) OR
    is_operator_or_admin()
  );

CREATE POLICY "System can insert scores" ON public.rift_scores
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update scores" ON public.rift_scores
  FOR UPDATE
  USING (true);

-- Create rift_score_overrides table
CREATE TABLE public.rift_score_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type entity_type_enum NOT NULL,
  entity_id UUID NOT NULL,
  delta INTEGER NOT NULL CHECK (delta >= -10 AND delta <= 10),
  reason TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rift_score_overrides ENABLE ROW LEVEL SECURITY;

-- RLS policies for overrides
CREATE POLICY "Operators can manage overrides" ON public.rift_score_overrides
  FOR ALL
  USING (is_operator_or_admin());

CREATE POLICY "Users can view org overrides" ON public.rift_score_overrides
  FOR SELECT
  USING (
    (entity_type = 'organization' AND entity_id = get_user_org_id()) OR
    (entity_type = 'invoice' AND entity_id IN (
      SELECT id FROM invoices WHERE org_id = get_user_org_id()
    )) OR
    is_operator_or_admin()
  );

-- Add industry column to organizations if missing
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS industry TEXT;