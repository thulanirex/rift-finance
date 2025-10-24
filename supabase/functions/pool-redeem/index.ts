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

    // Get user record
    const { data: userRecord, error: userRecordError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_id', user.id)
      .single();

    if (userRecordError || !userRecord) {
      console.error('User record error:', userRecordError);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { position_id } = await req.json();

    if (!position_id) {
      return new Response(JSON.stringify({ error: 'Missing position_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get position
    const { data: position, error: positionError } = await supabase
      .from('positions')
      .select('*, pool:pools(*)')
      .eq('id', position_id)
      .eq('funder_user_id', userRecord.id)
      .single();

    if (positionError || !position) {
      console.error('Position error:', positionError);
      return new Response(JSON.stringify({ error: 'Position not found or unauthorized' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (position.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Position is not active' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate mock txSig for redemption
    const mode = 'SIM';
    const mockTxSig = `SIM_REDEEM${Date.now()}${Math.random().toString(36).substring(2, 15)}`;

    // Calculate total return
    const totalReturn = position.amount_funded + position.accrued_yield;

    // Close position
    const { error: updateError } = await supabase
      .from('positions')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', position_id);

    if (updateError) {
      console.error('Error closing position:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to close position' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create ledger entry for distribution
    await supabase.from('ledger_entries').insert({
      user_id: userRecord.id,
      pool_id: position.pool_id,
      ref_type: 'position',
      ref_id: position.id,
      amount: totalReturn,
      tx_sig: mockTxSig,
      notes: `Redemption: principal ${position.amount_funded} + yield ${position.accrued_yield}`,
      metadata: { 
        mode, 
        redemption: true,
        principal: position.amount_funded,
        yield: position.accrued_yield,
        total: totalReturn,
      },
    });

    // Update pool liquidity
    await supabase
      .from('pools')
      .update({
        tvl: (position.pool.tvl || 0) - position.amount_funded,
        available_liquidity: (position.pool.available_liquidity || 0) - position.amount_funded,
      })
      .eq('id', position.pool_id);

    // Audit log
    await supabase.from('audit_logs').insert({
      actor_user_id: userRecord.id,
      action: 'POOL_REDEEM',
      entity: 'position',
      entity_id: position.id,
      metadata: {
        pool_id: position.pool_id,
        principal: position.amount_funded,
        accrued_yield: position.accrued_yield,
        total_return: totalReturn,
        tx_sig: mockTxSig,
        mode,
      },
    });

    console.log('Position redeemed:', position.id);

    return new Response(JSON.stringify({
      success: true,
      redemption: {
        position_id: position.id,
        principal: position.amount_funded,
        yield: position.accrued_yield,
        total: totalReturn,
        tx_sig: mockTxSig,
        mode,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pool-redeem:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
