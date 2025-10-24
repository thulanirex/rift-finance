-- Create enums
CREATE TYPE public.user_role AS ENUM ('seller', 'buyer', 'funder', 'operator', 'admin');
CREATE TYPE public.kyb_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'listed', 'funded', 'repaid', 'defaulted');
CREATE TYPE public.rift_grade AS ENUM ('A', 'B', 'C');
CREATE TYPE public.position_status AS ENUM ('active', 'closed', 'defaulted');
CREATE TYPE public.ledger_ref_type AS ENUM ('deposit', 'payout', 'repayment_inflow', 'distribution', 'fee');
CREATE TYPE public.wallet_provider AS ENUM ('privy', 'web3auth');

-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  vat_number TEXT,
  eori_number TEXT,
  iban TEXT,
  kyb_status public.kyb_status DEFAULT 'pending',
  kyb_raw JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_organizations_vat ON public.organizations(vat_number);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Wallets table
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider public.wallet_provider NOT NULL,
  address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role public.user_role NOT NULL,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES public.wallets(id),
  civic_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_org ON public.users(org_id);
CREATE INDEX idx_users_auth ON public.users(auth_id);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  amount_eur NUMERIC(18,2) NOT NULL,
  due_date DATE NOT NULL,
  counterparty TEXT NOT NULL,
  file_url TEXT,
  file_hash TEXT,
  cnft_mint TEXT,
  rift_score INTEGER,
  rift_grade public.rift_grade,
  status public.invoice_status DEFAULT 'draft',
  tenor_days INTEGER CHECK (tenor_days IN (30, 90, 120)),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoices_org ON public.invoices(org_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Pools table
CREATE TABLE public.pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenor_days INTEGER UNIQUE NOT NULL CHECK (tenor_days IN (30, 90, 120)),
  apr NUMERIC(6,3) NOT NULL,
  total_liquidity NUMERIC(18,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pools ENABLE ROW LEVEL SECURITY;

-- Positions table
CREATE TABLE public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  funder_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount_funded NUMERIC(18,2) NOT NULL,
  expected_yield NUMERIC(18,2) NOT NULL,
  accrued_yield NUMERIC(18,2) DEFAULT 0,
  status public.position_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_positions_pool ON public.positions(pool_id);
CREATE INDEX idx_positions_funder ON public.positions(funder_user_id);
CREATE INDEX idx_positions_invoice ON public.positions(invoice_id);
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- Ledger entries table
CREATE TABLE public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_type public.ledger_ref_type NOT NULL,
  ref_id UUID,
  pool_id UUID REFERENCES public.pools(id),
  org_id UUID REFERENCES public.organizations(id),
  user_id UUID REFERENCES public.users(id),
  amount NUMERIC(18,2) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ledger_pool ON public.ledger_entries(pool_id);
CREATE INDEX idx_ledger_org ON public.ledger_entries(org_id);
CREATE INDEX idx_ledger_user ON public.ledger_entries(user_id);
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_actor ON public.audit_logs(actor_user_id);
CREATE INDEX idx_audit_entity ON public.audit_logs(entity, entity_id);
CREATE INDEX idx_audit_timestamp ON public.audit_logs(timestamp DESC);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's org_id
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_uuid UUID;
BEGIN
  SELECT org_id INTO org_uuid
  FROM public.users
  WHERE auth_id = auth.uid();
  RETURN org_uuid;
END;
$$;

-- Helper function to check if user is operator or admin
CREATE OR REPLACE FUNCTION public.is_operator_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_val public.user_role;
BEGIN
  SELECT role INTO user_role_val
  FROM public.users
  WHERE auth_id = auth.uid();
  RETURN user_role_val IN ('operator', 'admin');
END;
$$;

-- RLS Policies for Organizations
CREATE POLICY "Users can view own org" ON public.organizations
  FOR SELECT USING (id = public.get_user_org_id() OR public.is_operator_or_admin());

CREATE POLICY "Users can update own org" ON public.organizations
  FOR UPDATE USING (id = public.get_user_org_id() OR public.is_operator_or_admin());

CREATE POLICY "Operators can view all orgs" ON public.organizations
  FOR ALL USING (public.is_operator_or_admin());

-- RLS Policies for Users
CREATE POLICY "Users can view org members" ON public.users
  FOR SELECT USING (org_id = public.get_user_org_id() OR public.is_operator_or_admin());

CREATE POLICY "Operators can manage all users" ON public.users
  FOR ALL USING (public.is_operator_or_admin());

-- RLS Policies for Invoices
CREATE POLICY "Users can view org invoices" ON public.invoices
  FOR SELECT USING (org_id = public.get_user_org_id() OR public.is_operator_or_admin());

CREATE POLICY "Sellers can create invoices" ON public.invoices
  FOR INSERT WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY "Users can update org invoices" ON public.invoices
  FOR UPDATE USING (org_id = public.get_user_org_id() OR public.is_operator_or_admin());

CREATE POLICY "Operators can manage all invoices" ON public.invoices
  FOR ALL USING (public.is_operator_or_admin());

-- RLS Policies for Pools (public read, operator write)
CREATE POLICY "Anyone can view pools" ON public.pools
  FOR SELECT USING (true);

CREATE POLICY "Operators can manage pools" ON public.pools
  FOR ALL USING (public.is_operator_or_admin());

-- RLS Policies for Positions
CREATE POLICY "Funders can view own positions" ON public.positions
  FOR SELECT USING (funder_user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR public.is_operator_or_admin());

CREATE POLICY "Funders can create positions" ON public.positions
  FOR INSERT WITH CHECK (funder_user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Operators can manage positions" ON public.positions
  FOR ALL USING (public.is_operator_or_admin());

-- RLS Policies for Ledger
CREATE POLICY "Users can view org ledger" ON public.ledger_entries
  FOR SELECT USING (org_id = public.get_user_org_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR public.is_operator_or_admin());

CREATE POLICY "System can insert ledger" ON public.ledger_entries
  FOR INSERT WITH CHECK (true);

-- RLS Policies for Audit Logs
CREATE POLICY "Users can view related audit logs" ON public.audit_logs
  FOR SELECT USING (actor_user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR public.is_operator_or_admin());

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for Wallets
CREATE POLICY "Users can view own wallet" ON public.wallets
  FOR SELECT USING (id IN (SELECT wallet_id FROM public.users WHERE auth_id = auth.uid()) OR public.is_operator_or_admin());

CREATE POLICY "Users can create wallets" ON public.wallets
  FOR INSERT WITH CHECK (true);

-- Seed pools data
INSERT INTO public.pools (tenor_days, apr) VALUES
  (30, 5.000),
  (90, 7.000),
  (120, 10.000);

-- Seed organizations
INSERT INTO public.organizations (id, name, country, vat_number, eori_number, iban, kyb_status, kyb_raw) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Ardmore Exports Ltd', 'IE', 'IE1234567A', 'IE123456789', 'IE12BOFI90000112345678', 'approved', '{"review": {"status": "completed", "result": "approved", "risk_score": 0.14}, "reference_id": "MOCK-KYB-001"}'),
  ('22222222-2222-2222-2222-222222222222', 'Baltic Foods GmbH', 'DE', 'DE123456789', 'DE987654321', 'DE89370400440532013000', 'pending', '{"review": {"status": "pending"}, "reference_id": "MOCK-KYB-002"}'),
  ('33333333-3333-3333-3333-333333333333', 'Cordoba Trading SRL', 'ES', 'ESX1234567X', 'ES246813579', 'ES9121000418450200051332', 'rejected', '{"review": {"status": "completed", "result": "rejected", "risk_score": 0.87, "reason": "Adverse media findings"}, "reference_id": "MOCK-KYB-003"}');

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pools_updated_at BEFORE UPDATE ON public.pools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON public.positions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();