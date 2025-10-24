-- Create mock funder user for presentation
-- Email: demo.funder@rift.finance
-- Password: RiftDemo2025!

-- Insert user record (auth_id will need to be created via signup first)
-- This migration creates the profile data structure that will be linked once user signs up

DO $$
DECLARE
  mock_user_id uuid := '00000000-0000-0000-0000-000000000001';
  mock_org_id uuid := gen_random_uuid();
  mock_wallet_id uuid := gen_random_uuid();
BEGIN
  -- Insert wallet
  INSERT INTO public.wallets (id, address, provider, created_at)
  VALUES (
    mock_wallet_id,
    'DemoWallet7x8K9pQzRmT3vN4sL2wY6h1B',
    'privy',
    now()
  );

  -- Insert mock organization for the funder
  INSERT INTO public.organizations (
    id, name, country, registration_country, registration_number,
    legal_form, vat_number, email, phone, website,
    industry, address_line1, city, postal_code,
    kyb_status, created_at, updated_at
  )
  VALUES (
    mock_org_id,
    'Demo Capital Partners Ltd',
    'IE',
    'IE',
    'IE123456',
    'Limited Company',
    'IE9876543',
    'contact@democapital.ie',
    '+353 1 234 5678',
    'https://democapital.ie',
    'Financial Services',
    '123 St Stephen''s Green',
    'Dublin',
    'D02 X285',
    'approved',
    now(),
    now()
  );

  -- Note: The user record will be created automatically when they sign up
  -- This ensures the user record with the correct auth_id after signup:
  -- Email: demo.funder@rift.finance
  -- Password: RiftDemo2025!
  
  -- After signup, run this to link the user:
  -- UPDATE public.users SET org_id = '<mock_org_id>', wallet_id = '<mock_wallet_id>', 
  -- role = 'funder', gate_status = 'verified', civic_verified = true
  -- WHERE email = 'demo.funder@rift.finance';

END $$;