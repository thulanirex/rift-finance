import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { screeningAdapter } from '../_shared/adapters.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  method?: 'kyb_only' | 'email_allowlist' | 'sanctions_check' | 'combo';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '',
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

    const { method = 'combo' }: VerifyRequest = await req.json().catch(() => ({}));
    const gateMode = Deno.env.get('GATE_MODE') || 'mock';
    
    console.log('Gate verification started:', { userId: user.id, method, gateMode });

    // Get user record with org
    const { data: userRecord, error: userError } = await supabaseClient
      .from('users')
      .select('*, organizations(*), wallets(*)')
      .eq('auth_id', user.id)
      .single();

    if (userError) throw userError;

    const walletAddress = userRecord.wallets?.address || 'no-wallet';

    // Mock mode: instant approval
    if (gateMode === 'mock') {
      console.log('Mock mode: auto-approving');
      
      // Update user gate status
      await supabaseClient
        .from('users')
        .update({ 
          gate_status: 'verified',
          gate_updated_at: new Date().toISOString()
        })
        .eq('id', userRecord.id);

      // Insert verification record
      await supabaseClient
        .from('gate_verifications')
        .insert({
          user_id: userRecord.id,
          wallet_address: walletAddress,
          method,
          mode: 'mock',
          result: 'approved',
          reasons: ['mock-approval'],
          raw: { mode: 'mock', timestamp: new Date().toISOString() }
        });

      // Audit log
      await supabaseClient.from('audit_logs').insert({
        actor_user_id: userRecord.id,
        action: 'GATE_VERIFIED',
        entity: 'users',
        entity_id: userRecord.id,
        metadata: { method, mode: 'mock', result: 'approved' }
      });

      console.log('Gate verified (mock):', userRecord.id);

      return new Response(
        JSON.stringify({ 
          verified: true, 
          mode: 'mock',
          wallet_address: walletAddress
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Live mode: perform actual checks
    console.log('Live mode: performing checks');
    const reasons: string[] = [];
    let approved = false;

    // Check 1: KYB status
    if (userRecord.organizations?.kyb_status === 'approved') {
      reasons.push('kyb-approved');
      approved = true;
    }

    // Check 2: Allowlist
    const { data: allowlistEntry } = await supabaseClient
      .from('allowlist_wallets')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (allowlistEntry) {
      const isExpired = allowlistEntry.expires_at && new Date(allowlistEntry.expires_at) < new Date();
      if (!isExpired) {
        reasons.push('allowlist-verified');
        approved = true;
      }
    }

    // Check 3: Sanctions screening
    if (method === 'sanctions_check' || method === 'combo') {
      const screeningResult = await screeningAdapter.run(
        userRecord.email,
        userRecord.organizations?.name || 'Unknown',
        false
      );
      
      if (screeningResult.clear) {
        reasons.push('sanctions-clear');
        approved = true;
      } else {
        reasons.push('sanctions-flagged');
        approved = false;
      }
    }

    const result = approved ? 'approved' : 'denied';
    const newStatus = approved ? 'verified' : 'denied';

    // Update user gate status
    await supabaseClient
      .from('users')
      .update({ 
        gate_status: newStatus,
        gate_updated_at: new Date().toISOString()
      })
      .eq('id', userRecord.id);

    // Insert verification record
    const { data: verification } = await supabaseClient
      .from('gate_verifications')
      .insert({
        user_id: userRecord.id,
        wallet_address: walletAddress,
        method,
        mode: 'live',
        result,
        reasons,
        raw: { 
          checks_performed: { kyb: true, allowlist: true, sanctions: method !== 'kyb_only' },
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    // Audit log
    await supabaseClient.from('audit_logs').insert({
      actor_user_id: userRecord.id,
      action: 'GATE_VERIFIED',
      entity: 'users',
      entity_id: userRecord.id,
      metadata: { method, mode: 'live', result, reasons }
    });

    console.log('Gate verification completed:', { result, reasons });

    // TODO: Mint SBT if approved and VERIPASS_COLLECTION_MINT is configured
    // This would require Bubblegum/Metaplex integration on Solana devnet
    // For now, we'll skip the actual minting and just log the intent
    let sbtMint = undefined;
    if (approved) {
      console.log('SBT minting would happen here (not implemented yet)');
      // Future: call Bubblegum/Metaplex to mint non-transferable cNFT
    }

    return new Response(
      JSON.stringify({ 
        verified: approved, 
        mode: 'live',
        wallet_address: walletAddress,
        reasons,
        sbtMint
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in gate-verify:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
