-- Clean up orphaned admin user record (no auth_id)
DELETE FROM public.users WHERE email = 'Info.novaque@gmail.com' AND auth_id IS NULL;

-- Ensure the handle_new_user trigger runs before setup_admin_user
-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;

-- Recreate trigger for creating user record (runs first)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE PROCEDURE public.handle_new_user();

-- Create trigger for admin setup (runs second)
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE PROCEDURE public.setup_admin_user();