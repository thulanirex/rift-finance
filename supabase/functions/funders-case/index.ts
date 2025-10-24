import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getAuthenticatedUser } from '../_shared/guards.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { user, userRecord } = await getAuthenticatedUser(req, supabaseClient);

    const url = new URL(req.url);
    const caseId = url.pathname.split('/').pop();

    // Get case with related data
    const { data: funderCase, error: caseError } = await supabaseClient
      .from('funder_cases')
      .select(`
        *,
        funder_profiles!inner(*),
        funder_documents(*),
        bank_accounts(*),
        decided_by_user:users!funder_cases_decided_by_fkey(email)
      `)
      .eq('id', caseId)
      .single();

    if (caseError) throw caseError;

    // Check access - user can only see their own case or operator/admin can see all
    if (
      funderCase.user_id !== userRecord.id &&
      !['operator', 'admin'].includes(userRecord.role)
    ) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(funderCase), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in funders-case:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});