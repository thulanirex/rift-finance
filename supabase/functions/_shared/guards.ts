import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function requireGate(supabaseClient: any, userId: string) {
  const { data: userRecord, error } = await supabaseClient
    .from('users')
    .select('gate_status')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error('Failed to check gate status');
  }

  if (userRecord.gate_status !== 'verified') {
    const gateError = new Error('GATE_REQUIRED');
    (gateError as any).code = 'GATE_REQUIRED';
    (gateError as any).status = 403;
    throw gateError;
  }

  return true;
}

export async function getAuthenticatedUser(req: Request, supabaseClient: any) {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  
  if (error || !user) {
    const authError = new Error('Unauthorized');
    (authError as any).status = 401;
    throw authError;
  }

  const { data: userRecord, error: userError } = await supabaseClient
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (userError) {
    throw new Error('User record not found');
  }

  return { user, userRecord };
}
