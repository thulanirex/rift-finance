import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching gate status for user:', user.id);

    // Get user record with wallet
    const { data: userRecord, error: userError } = await supabaseClient
      .from('users')
      .select('gate_status, gate_updated_at, wallets(address)')
      .eq('auth_id', user.id)
      .single();

    if (userError) throw userError;

    // Get latest verification
    const { data: latestVerification } = await supabaseClient
      .from('gate_verifications')
      .select('*')
      .eq('user_id', userRecord.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const walletAddress = userRecord.wallets?.address || null;
    const hasSbt = latestVerification?.raw?.sbtMint ? true : false;

    console.log('Gate status retrieved:', { 
      gate_status: userRecord.gate_status, 
      wallet_address: walletAddress,
      hasSbt 
    });

    return new Response(
      JSON.stringify({ 
        gate_status: userRecord.gate_status,
        gate_updated_at: userRecord.gate_updated_at,
        wallet_address: walletAddress,
        hasSbt,
        latest_verification: latestVerification
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in gate-status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
