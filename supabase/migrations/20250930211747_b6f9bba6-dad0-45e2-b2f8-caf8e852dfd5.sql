-- Add gate verification system tables

-- Add gate_status enum
CREATE TYPE public.gate_status AS ENUM ('unverified', 'pending', 'verified', 'denied');

-- Add gate_method enum
CREATE TYPE public.gate_method AS ENUM ('kyb_only', 'email_allowlist', 'sanctions_check', 'combo');

-- Add gate_mode enum
CREATE TYPE public.gate_mode AS ENUM ('mock', 'live');

-- Add gate_result enum
CREATE TYPE public.gate_result AS ENUM ('approved', 'denied');

-- Add gate fields to users table
ALTER TABLE public.users 
  ADD COLUMN gate_status public.gate_status DEFAULT 'unverified' NOT NULL,
  ADD COLUMN gate_updated_at TIMESTAMP WITH TIME ZONE;

-- Create gate_verifications table
CREATE TABLE public.gate_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  method public.gate_method NOT NULL,
  mode public.gate_mode NOT NULL,
  result public.gate_result NOT NULL,
  reasons TEXT[],
  raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on gate_verifications
ALTER TABLE public.gate_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own verifications
CREATE POLICY "Users can view own verifications"
ON public.gate_verifications
FOR SELECT
USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR is_operator_or_admin());

-- System can insert verifications
CREATE POLICY "System can insert verifications"
ON public.gate_verifications
FOR INSERT
WITH CHECK (true);

-- Create allowlist_wallets table
CREATE TABLE public.allowlist_wallets (
  wallet_address TEXT NOT NULL PRIMARY KEY,
  note TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on allowlist_wallets
ALTER TABLE public.allowlist_wallets ENABLE ROW LEVEL SECURITY;

-- Only operators can view/manage allowlist
CREATE POLICY "Operators can manage allowlist"
ON public.allowlist_wallets
FOR ALL
USING (is_operator_or_admin());

-- Create indexes for performance
CREATE INDEX idx_gate_verifications_user_id ON public.gate_verifications(user_id);
CREATE INDEX idx_gate_verifications_created_at ON public.gate_verifications(created_at DESC);
CREATE INDEX idx_allowlist_wallets_expires_at ON public.allowlist_wallets(expires_at);