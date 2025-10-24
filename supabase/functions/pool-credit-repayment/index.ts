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

    const { pool_tenor, amount, note } = await req.json();

    if (!pool_tenor || !amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Missing or invalid parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Crediting repayment:', { pool_tenor, amount, note });

    // Get pool
    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .select('*')
      .eq('tenor_days', pool_tenor)
      .single();

    if (poolError || !pool) {
      console.error('Pool error:', poolError);
      return new Response(JSON.stringify({ error: 'Pool not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all active positions in this pool
    const { data: positions, error: positionsError } = await supabase
      .from('positions')
      .select('*')
      .eq('pool_id', pool.id)
      .eq('status', 'active');

    if (positionsError) {
      console.error('Positions error:', positionsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch positions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!positions || positions.length === 0) {
      return new Response(JSON.stringify({ error: 'No active positions in this pool' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate total active principal
    const totalPrincipal = positions.reduce((sum, p) => sum + p.amount_funded, 0);

    // Distribute pro-rata to each position
    const distributions = [];
    let closedCount = 0;

    for (const position of positions) {
      const share = position.amount_funded / totalPrincipal;
      const distribution = amount * share;
      
      // Calculate new accrued yield (capped at expected)
      const newAccruedYield = Math.min(
        position.accrued_yield + distribution,
        position.expected_yield
      );
      
      const actualDistribution = newAccruedYield - position.accrued_yield;
      
      // Check if position is now fully yielded
      const shouldClose = Math.abs(newAccruedYield - position.expected_yield) < 0.01;

      // Update position
      await supabase
        .from('positions')
        .update({
          accrued_yield: newAccruedYield,
          status: shouldClose ? 'closed' : 'active',
          closed_at: shouldClose ? new Date().toISOString() : null,
        })
        .eq('id', position.id);

      // Create ledger entry for distribution
      await supabase.from('ledger_entries').insert({
        user_id: position.funder_user_id,
        pool_id: pool.id,
        ref_type: 'position',
        ref_id: position.id,
        amount: actualDistribution,
        notes: note || `Pro-rata yield distribution from repayment`,
        metadata: {
          repayment_credit: true,
          share,
          distribution,
          actualDistribution,
          closed: shouldClose,
        },
      });

      distributions.push({
        position_id: position.id,
        funder_user_id: position.funder_user_id,
        share,
        distribution: actualDistribution,
        new_accrued: newAccruedYield,
        closed: shouldClose,
      });

      if (shouldClose) closedCount++;
    }

    // Create pool-level credit ledger entry
    await supabase.from('ledger_entries').insert({
      pool_id: pool.id,
      ref_type: 'repayment',
      amount,
      notes: note || `Repayment credit to ${pool_tenor}d pool`,
      metadata: {
        pool_credit: true,
        tenor: pool_tenor,
        distributed_to: distributions.length,
        closed_positions: closedCount,
      },
    });

    // Update pool available liquidity
    await supabase
      .from('pools')
      .update({
        available_liquidity: (pool.available_liquidity || 0) + amount,
      })
      .eq('id', pool.id);

    // Audit log
    await supabase.from('audit_logs').insert({
      actor_user_id: user.id,
      action: 'POOL_REPAYMENT_CREDIT',
      entity: 'pool',
      entity_id: pool.id,
      metadata: {
        pool_tenor,
        amount,
        note,
        distributions: distributions.length,
        closed_positions: closedCount,
      },
    });

    console.log('Repayment credited:', { pool_id: pool.id, amount, distributions: distributions.length });

    return new Response(JSON.stringify({
      success: true,
      pool_id: pool.id,
      amount,
      distributions,
      closed_positions: closedCount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pool-credit-repayment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
