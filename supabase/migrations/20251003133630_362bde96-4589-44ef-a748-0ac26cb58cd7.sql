-- Create function to auto-create user records on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a user record for every new auth user
  INSERT INTO public.users (auth_id, email, role, gate_status, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'funder', -- default role
    'unverified',
    now(),
    now()
  )
  ON CONFLICT (auth_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for all signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();