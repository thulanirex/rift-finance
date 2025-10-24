-- Create enums for funder profile types
CREATE TYPE public.funder_type AS ENUM ('individual', 'entity');
CREATE TYPE public.accreditation AS ENUM ('na', 'retail', 'professional', 'accredited');
CREATE TYPE public.source_of_funds AS ENUM ('salary', 'savings', 'business_income', 'investment_returns', 'inheritance', 'crypto_proceeds', 'other');
CREATE TYPE public.income_band AS ENUM ('lt_50k', '50k_200k', '200k_1m', 'gt_1m');
CREATE TYPE public.net_worth_band AS ENUM ('lt_250k', '250k_1m', '1m_5m', 'gt_5m');
CREATE TYPE public.profile_status AS ENUM ('draft', 'submitted', 'in_review', 'approved', 'rejected');
CREATE TYPE public.doc_type AS ENUM ('passport', 'national_id', 'proof_of_address', 'company_registry', 'board_resolution', 'authorized_signatory', 'w8_w9', 'bank_statement', 'other');
CREATE TYPE public.case_type AS ENUM ('kyc_individual', 'kyb_entity');
CREATE TYPE public.case_status AS ENUM ('open', 'in_review', 'approved', 'rejected', 'awaiting_docs');
CREATE TYPE public.case_provider AS ENUM ('mock', 'sumsub', 'veriff');

-- Create funder_profiles table
CREATE TABLE public.funder_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  type public.funder_type NOT NULL,
  residency_country TEXT NOT NULL,
  nationality TEXT,
  accreditation public.accreditation DEFAULT 'na',
  source_of_funds public.source_of_funds[],
  source_of_wealth TEXT,
  annual_income_band public.income_band,
  net_worth_band public.net_worth_band,
  tax_residency_country TEXT NOT NULL,
  tin TEXT,
  fatca_crs_self_cert JSONB,
  aml_answers JSONB,
  consent_docs JSONB,
  status public.profile_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.funder_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for funder_profiles
CREATE POLICY "Users can view own funder profile"
  ON public.funder_profiles FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR is_operator_or_admin());

CREATE POLICY "Users can insert own funder profile"
  ON public.funder_profiles FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own funder profile"
  ON public.funder_profiles FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR is_operator_or_admin());

CREATE POLICY "Operators can manage all funder profiles"
  ON public.funder_profiles FOR ALL
  USING (is_operator_or_admin());

-- Create funder_documents table
CREATE TABLE public.funder_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  entity_name TEXT,
  doc_type public.doc_type NOT NULL,
  file_url TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  issued_on DATE,
  expires_on DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.funder_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for funder_documents
CREATE POLICY "Users can view own documents"
  ON public.funder_documents FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR is_operator_or_admin());

CREATE POLICY "Users can insert own documents"
  ON public.funder_documents FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Operators can manage all documents"
  ON public.funder_documents FOR ALL
  USING (is_operator_or_admin());

-- Create funder_cases table
CREATE TABLE public.funder_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  type public.case_type NOT NULL,
  status public.case_status DEFAULT 'open',
  provider public.case_provider NOT NULL,
  provider_ref TEXT,
  checklist JSONB,
  decision_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  decided_at TIMESTAMP WITH TIME ZONE,
  decided_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.funder_cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for funder_cases
CREATE POLICY "Users can view own cases"
  ON public.funder_cases FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR is_operator_or_admin());

CREATE POLICY "Users can insert own cases"
  ON public.funder_cases FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Operators can manage all cases"
  ON public.funder_cases FOR ALL
  USING (is_operator_or_admin());

-- Create bank_accounts table
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  iban TEXT NOT NULL,
  account_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  country TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bank_accounts
CREATE POLICY "Users can view own bank accounts"
  ON public.bank_accounts FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR is_operator_or_admin());

CREATE POLICY "Users can insert own bank accounts"
  ON public.bank_accounts FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own bank accounts"
  ON public.bank_accounts FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR is_operator_or_admin());

CREATE POLICY "Operators can manage all bank accounts"
  ON public.bank_accounts FOR ALL
  USING (is_operator_or_admin());

-- Create triggers for updated_at
CREATE TRIGGER update_funder_profiles_updated_at
  BEFORE UPDATE ON public.funder_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();