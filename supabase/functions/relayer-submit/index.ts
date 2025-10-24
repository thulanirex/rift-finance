import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is operator or admin
    const { data: userData, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single();

    if (roleError || !userData || !['operator', 'admin'].includes(userData.role)) {
      console.error('Role check failed:', roleError);
      return new Response(JSON.stringify({ error: 'Forbidden - operator or admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { serializedTransaction, description } = await req.json();

    if (!serializedTransaction) {
      return new Response(JSON.stringify({ error: 'Missing serializedTransaction' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Submitting transaction:', description || 'No description');

    // Get RPC URL - prefer Helius if available, fallback to SOLANA_RPC_URL
    const heliusApiKey = Deno.env.get('HELIUS_API_KEY');
    const solanaRpcUrl = Deno.env.get('SOLANA_RPC_URL') || 'https://api.devnet.solana.com';
    
    const rpcUrl = heliusApiKey 
      ? `https://devnet.helius-rpc.com/?api-key=${heliusApiKey}`
      : solanaRpcUrl;

    console.log('Using RPC:', heliusApiKey ? 'Helius' : 'Public Devnet');

    // Submit transaction to Solana devnet
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: [
          serializedTransaction,
          {
            encoding: 'base64',
            skipPreflight: false,
            preflightCommitment: 'confirmed',
            maxRetries: 3,
          },
        ],
      }),
    });

    const result = await response.json();

    if (result.error) {
      console.error('Solana RPC error:', result.error);
      return new Response(JSON.stringify({ 
        error: 'Transaction failed',
        details: result.error 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const txSignature = result.result;
    console.log('Transaction submitted:', txSignature);

    // Audit log
    await supabase.from('audit_logs').insert({
      actor_user_id: user.id,
      action: 'RELAYER_TX_SUBMITTED',
      entity: 'transaction',
      metadata: {
        tx_signature: txSignature,
        description,
        rpc_provider: heliusApiKey ? 'helius' : 'public',
      },
    });

    return new Response(JSON.stringify({ 
      success: true,
      txSignature,
      explorerUrl: `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in relayer-submit:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
