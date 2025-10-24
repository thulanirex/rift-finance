-- Fix: Remove the faulty admin user migration and properly set up admin user
-- First, check if user exists and update/insert accordingly

DO $$
DECLARE
  existing_user_id uuid;
BEGIN
  -- Check if admin email already exists in users table
  SELECT id INTO existing_user_id 
  FROM public.users 
  WHERE email = 'Info.novaque@gmail.com';
  
  IF existing_user_id IS NULL THEN
    -- User doesn't exist in public.users yet, they need to sign up first
    -- We'll just ensure they get admin role when they do sign up via trigger
    RAISE NOTICE 'Admin user will be created when Info.novaque@gmail.com signs up';
  ELSE
    -- User exists, update to admin
    UPDATE public.users 
    SET 
      role = 'admin',
      gate_status = 'verified',
      civic_verified = true,
      updated_at = now()
    WHERE id = existing_user_id;
    
    RAISE NOTICE 'Existing user updated to admin role';
  END IF;
END $$;

-- Create a trigger to automatically make Info.novaque@gmail.com an admin on signup
CREATE OR REPLACE FUNCTION public.setup_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only process if this is the admin email
  IF NEW.email = 'Info.novaque@gmail.com' THEN
    UPDATE public.users 
    SET 
      role = 'admin',
      gate_status = 'verified',
      civic_verified = true,
      updated_at = now()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS on_admin_user_created ON public.users;

CREATE TRIGGER on_admin_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW
  WHEN (NEW.email = 'Info.novaque@gmail.com')
  EXECUTE FUNCTION public.setup_admin_user();