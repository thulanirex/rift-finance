-- Create function to auto-setup demo funder user
CREATE OR REPLACE FUNCTION public.setup_demo_funder()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  demo_wallet_id uuid;
  demo_org_id uuid;
BEGIN
  -- Only process if this is the demo funder email
  IF NEW.email = 'demo.funder@rift.finance' THEN
    -- Get the mock wallet and org IDs
    SELECT id INTO demo_wallet_id FROM public.wallets WHERE address = 'DemoWallet7x8K9pQzRmT3vN4sL2wY6h1B' LIMIT 1;
    SELECT id INTO demo_org_id FROM public.organizations WHERE email = 'contact@democapital.ie' LIMIT 1;
    
    IF demo_wallet_id IS NOT NULL AND demo_org_id IS NOT NULL THEN
      -- Update the user with demo data
      UPDATE public.users 
      SET 
        org_id = demo_org_id,
        wallet_id = demo_wallet_id,
        role = 'funder',
        gate_status = 'verified',
        civic_verified = true
      WHERE id = NEW.id;
      
      -- Create funder profile
      INSERT INTO public.funder_profiles (
        user_id, type, accreditation, tax_residency_country, residency_country,
        nationality, annual_income_band, net_worth_band, source_of_funds,
        source_of_wealth, status, created_at, updated_at
      )
      VALUES (
        NEW.id,
        'individual',
        'accredited',
        'IE',
        'IE',
        'IE',
        'eur_100k_250k',
        'eur_1m_5m',
        ARRAY['salary', 'investments']::text[],
        'Professional income and investment portfolio',
        'approved',
        now(),
        now()
      )
      ON CONFLICT (user_id) DO NOTHING;
      
      -- Create bank account
      INSERT INTO public.bank_accounts (
        user_id, account_name, iban, bank_name, country, verified, created_at
      )
      VALUES (
        NEW.id,
        'Demo Funder Account',
        'IE29AIBK93115212345678',
        'Allied Irish Banks',
        'IE',
        true,
        now()
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after user insert
DROP TRIGGER IF EXISTS setup_demo_funder_trigger ON public.users;
CREATE TRIGGER setup_demo_funder_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.setup_demo_funder();