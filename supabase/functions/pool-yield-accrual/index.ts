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

    console.log('[Yield Accrual] Starting hourly yield accrual job');

    // Get all active positions with pool details
    const { data: positions, error: positionsError } = await supabase
      .from('positions')
      .select('*, pool:pools(apr)')
      .eq('status', 'active');

    if (positionsError) {
      console.error('Error fetching positions:', positionsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch positions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!positions || positions.length === 0) {
      console.log('[Yield Accrual] No active positions to process');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No active positions',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let processedCount = 0;
    let totalAccrued = 0;

    // Process each position
    for (const position of positions) {
      // hourly_rate = apr / 365 / 24
      const hourlyRate = position.pool.apr / 365 / 24;
      const increment = position.amount_funded * hourlyRate;

      // Cap at expected yield
      const newAccruedYield = Math.min(
        position.accrued_yield + increment,
        position.expected_yield
      );

      // Update position
      await supabase
        .from('positions')
        .update({
          accrued_yield: newAccruedYield,
        })
        .eq('id', position.id);

      processedCount++;
      totalAccrued += (newAccruedYield - position.accrued_yield);
    }

    // Snapshot each pool
    const { data: pools, error: poolsError } = await supabase
      .from('pools')
      .select('*');

    if (!poolsError && pools) {
      for (const pool of pools) {
        await supabase
          .from('pool_snapshots')
          .insert({
            pool_id: pool.id,
            tvl: pool.tvl || 0,
            available_liquidity: pool.available_liquidity || 0,
          });
      }
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      action: 'POOL_YIELD_ACCRUED',
      entity: 'system',
      metadata: {
        positions_processed: processedCount,
        total_accrued: totalAccrued,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`[Yield Accrual] Processed ${processedCount} positions, accrued ${totalAccrued.toFixed(4)}`);

    return new Response(JSON.stringify({
      success: true,
      processed: processedCount,
      total_accrued: totalAccrued,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pool-yield-accrual:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
