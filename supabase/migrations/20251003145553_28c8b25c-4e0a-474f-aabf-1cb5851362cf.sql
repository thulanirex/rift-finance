-- Create admin user for Info.novaque@gmail.com
-- First, we need to insert into auth.users, but we'll use a function to handle this properly

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if admin user already exists in public.users
  SELECT id INTO v_user_id FROM public.users WHERE email = 'Info.novaque@gmail.com';
  
  IF v_user_id IS NULL THEN
    -- Create a placeholder user record for the admin
    -- Note: The actual auth.users entry should be created through Supabase Auth signup
    -- This creates the public.users record that will be linked when they sign up
    INSERT INTO public.users (email, role, gate_status, created_at, updated_at)
    VALUES (
      'Info.novaque@gmail.com',
      'admin',
      'verified',
      now(),
      now()
    )
    RETURNING id INTO v_user_id;
    
    RAISE NOTICE 'Admin user record created. User must sign up with email Info.novaque@gmail.com and password Monday01 through the application.';
  ELSE
    -- Update existing user to admin role
    UPDATE public.users 
    SET 
      role = 'admin',
      gate_status = 'verified',
      updated_at = now()
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Existing user updated to admin role.';
  END IF;
END $$;