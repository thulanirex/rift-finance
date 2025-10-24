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

    // Get profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('funder_profiles')
      .select('*')
      .eq('user_id', userRecord.id)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
      return new Response(JSON.stringify(null), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get related data separately (since there's no direct FK relationship)
    const { data: documents } = await supabaseClient
      .from('funder_documents')
      .select('*')
      .eq('user_id', userRecord.id);

    const { data: cases } = await supabaseClient
      .from('funder_cases')
      .select('*')
      .eq('user_id', userRecord.id);

    const { data: bankAccounts } = await supabaseClient
      .from('bank_accounts')
      .select('*')
      .eq('user_id', userRecord.id);

    // Combine all data
    const enrichedProfile = {
      ...profile,
      funder_documents: documents || [],
      funder_cases: cases || [],
      bank_accounts: bankAccounts || [],
    };

    return new Response(JSON.stringify(enrichedProfile), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in funders-profile:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});