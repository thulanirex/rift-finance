-- Extend organizations table with KYB fields
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS legal_form TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS registration_number TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS registration_country TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS date_of_incorporation DATE;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS trading_name TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS kyb_score INTEGER;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS pep_risk TEXT DEFAULT 'unknown' CHECK (pep_risk IN ('unknown', 'clear', 'match'));
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS sanctions_risk TEXT DEFAULT 'unknown' CHECK (sanctions_risk IN ('unknown', 'clear', 'hit'));

-- Create doc type enum for org documents
CREATE TYPE public.org_doc_type AS ENUM (
  'certificate_of_incorporation',
  'memorandum',
  'articles',
  'vat_certificate',
  'utility_bill',
  'bank_statement',
  'directors_register',
  'shareholders_register',
  'proof_of_address',
  'other'
);

-- Create org_documents table
CREATE TABLE public.org_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  doc_type public.org_doc_type NOT NULL,
  file_url TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  issued_on DATE,
  expires_on DATE,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.org_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for org_documents
CREATE POLICY "Users can view org documents"
  ON public.org_documents FOR SELECT
  USING (org_id = get_user_org_id() OR is_operator_or_admin());

CREATE POLICY "Users can insert org documents"
  ON public.org_documents FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Operators can manage all org documents"
  ON public.org_documents FOR ALL
  USING (is_operator_or_admin());

-- Create beneficial_owners table
CREATE TYPE public.bo_role AS ENUM ('ubo', 'director', 'signatory');
CREATE TYPE public.kyc_status_enum AS ENUM ('draft', 'submitted', 'in_review', 'approved', 'rejected');
CREATE TYPE public.risk_status AS ENUM ('unknown', 'clear', 'match', 'hit');

CREATE TABLE public.beneficial_owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role public.bo_role NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob DATE NOT NULL,
  nationality TEXT NOT NULL,
  country_of_residence TEXT NOT NULL,
  pep_status public.risk_status DEFAULT 'unknown',
  sanctions_status public.risk_status DEFAULT 'unknown',
  kyc_status public.kyc_status_enum DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beneficial_owners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for beneficial_owners
CREATE POLICY "Users can view org beneficial owners"
  ON public.beneficial_owners FOR SELECT
  USING (org_id = get_user_org_id() OR is_operator_or_admin());

CREATE POLICY "Users can insert org beneficial owners"
  ON public.beneficial_owners FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update org beneficial owners"
  ON public.beneficial_owners FOR UPDATE
  USING (org_id = get_user_org_id() OR is_operator_or_admin());

CREATE POLICY "Operators can manage all beneficial owners"
  ON public.beneficial_owners FOR ALL
  USING (is_operator_or_admin());

-- Create bo_doc_type enum
CREATE TYPE public.bo_doc_type AS ENUM (
  'passport',
  'national_id',
  'driver_license',
  'selfie',
  'proof_of_address',
  'other'
);

-- Create bo_documents table
CREATE TABLE public.bo_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bo_id UUID NOT NULL REFERENCES public.beneficial_owners(id) ON DELETE CASCADE,
  doc_type public.bo_doc_type NOT NULL,
  file_url TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  issued_on DATE,
  expires_on DATE,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bo_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bo_documents
CREATE POLICY "Users can view bo documents"
  ON public.bo_documents FOR SELECT
  USING (
    bo_id IN (
      SELECT id FROM public.beneficial_owners WHERE org_id = get_user_org_id()
    ) OR is_operator_or_admin()
  );

CREATE POLICY "Users can insert bo documents"
  ON public.bo_documents FOR INSERT
  WITH CHECK (
    bo_id IN (
      SELECT id FROM public.beneficial_owners WHERE org_id = get_user_org_id()
    )
  );

CREATE POLICY "Operators can manage all bo documents"
  ON public.bo_documents FOR ALL
  USING (is_operator_or_admin());

-- Create kyb_cases table
CREATE TABLE public.kyb_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
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
ALTER TABLE public.kyb_cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kyb_cases
CREATE POLICY "Users can view org kyb cases"
  ON public.kyb_cases FOR SELECT
  USING (org_id = get_user_org_id() OR is_operator_or_admin());

CREATE POLICY "Users can insert org kyb cases"
  ON public.kyb_cases FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Operators can manage all kyb cases"
  ON public.kyb_cases FOR ALL
  USING (is_operator_or_admin());

-- Create triggers for updated_at
CREATE TRIGGER update_beneficial_owners_updated_at
  BEFORE UPDATE ON public.beneficial_owners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();