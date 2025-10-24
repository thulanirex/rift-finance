import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { requireGate } from "../_shared/guards.ts";

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

    // Get user record
    const { data: userRecord, error: userRecordError } = await supabase
      .from('users')
      .select('id, role, gate_status')
      .eq('auth_id', user.id)
      .single();

    if (userRecordError || !userRecord) {
      console.error('User record error:', userRecordError);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check role
    if (!['funder', 'operator', 'admin'].includes(userRecord.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden - funder role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Require gate verification
    try {
      await requireGate(supabase, userRecord.id);
    } catch (gateError: any) {
      console.error('Gate verification failed:', gateError);
      return new Response(JSON.stringify({ 
        error: 'Gate verification required',
        code: 'GATE_REQUIRED'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { tenor_days, amount, wallet_address, network, idempotencyKey } = await req.json();

    if (!tenor_days || !amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Missing or invalid parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!wallet_address) {
      return new Response(JSON.stringify({ error: 'Wallet address required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate tenor
    if (![30, 90, 120].includes(tenor_days)) {
      return new Response(JSON.stringify({ error: 'Invalid tenor_days. Must be 30, 90, or 120' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Allocating to pool:', { 
      tenor_days, 
      amount, 
      user_id: userRecord.id, 
      wallet_address,
      network: network || 'devnet',
      idempotencyKey 
    });

    // Get pool by tenor
    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .select('*')
      .eq('tenor_days', tenor_days)
      .single();

    if (poolError || !pool) {
      console.error('Pool error:', poolError);
      return new Response(JSON.stringify({ error: 'Pool not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate expected yield: amount * apr * (tenor_days / 365)
    const expectedYield = amount * pool.apr * (tenor_days / 365);

    // Generate mock txSig for Testnet simulation
    const mode = network === 'devnet' ? 'TESTNET' : 'SIM';
    const mockTxSig = `${mode}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Create position
    const { data: position, error: positionError } = await supabase
      .from('positions')
      .insert({
        pool_id: pool.id,
        funder_user_id: userRecord.id,
        invoice_id: null,
        amount_funded: amount,
        expected_yield: expectedYield,
        accrued_yield: 0,
        status: 'active',
        chain_tx: mockTxSig,
      })
      .select()
      .single();

    if (positionError) {
      console.error('Position insert error:', positionError);
      return new Response(JSON.stringify({ error: 'Failed to create position', details: positionError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create ledger entry
    await supabase.from('ledger_entries').insert({
      user_id: userRecord.id,
      pool_id: pool.id,
      ref_type: 'position',
      ref_id: position.id,
      amount,
      tx_sig: mockTxSig,
      notes: `Deposit to ${tenor_days}d pool via ${wallet_address}`,
      metadata: { 
        mode, 
        pool_tenor: tenor_days, 
        wallet_address,
        network: network || 'devnet',
        idempotencyKey 
      },
    });

    // Update pool liquidity
    const { error: poolUpdateError } = await supabase
      .from('pools')
      .update({
        total_liquidity: (pool.total_liquidity || 0) + amount,
        tvl: (pool.tvl || 0) + amount,
        available_liquidity: (pool.available_liquidity || 0) + amount,
      })
      .eq('id', pool.id);

    if (poolUpdateError) {
      console.error('Pool update error:', poolUpdateError);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      actor_user_id: userRecord.id,
      action: 'POOL_ALLOCATE',
      entity: 'position',
      entity_id: position.id,
      metadata: {
        pool_id: pool.id,
        tenor_days,
        amount,
        expected_yield: expectedYield,
        tx_sig: mockTxSig,
        wallet_address,
        network: network || 'devnet',
        mode,
        idempotencyKey,
      },
    });

    console.log('Position created:', position.id);

    return new Response(JSON.stringify({
      success: true,
      position: {
        id: position.id,
        pool_id: pool.id,
        tenor_days,
        amount_funded: amount,
        expected_yield: expectedYield,
        status: 'active',
        tx_sig: mockTxSig,
        mode,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pool-allocate:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});