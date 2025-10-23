-- Fix: Allow users to read their own user record
-- This is critical for the auth system to work

-- Add policy for users to view their own record
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT 
  USING (auth_id = auth.uid());

-- Add policy for users to update their own record (for role selection)
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE 
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Add policy for authenticated users to insert their own record
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT 
  WITH CHECK (auth_id = auth.uid());
