-- Fix: Add unique constraint on auth_id to prevent signup conflicts
ALTER TABLE public.users ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);

-- Fix: Ensure admin user setup works correctly by checking email case-insensitively
CREATE OR REPLACE FUNCTION public.setup_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Process admin email (case-insensitive)
  IF LOWER(NEW.email) = 'info.novaque@gmail.com' THEN
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
$$;