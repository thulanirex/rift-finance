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
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get environment info
    const network = Deno.env.get('NETWORK') || 'devnet';
    const solanaRpcUrl = Deno.env.get('SOLANA_RPC_URL') || 'https://api.devnet.solana.com';
    const heliusApiKey = Deno.env.get('HELIUS_API_KEY');

    // Check last yield accrual run
    const { data: lastAccrual } = await supabase
      .from('audit_logs')
      .select('timestamp')
      .eq('action', 'POOL_YIELD_ACCRUED')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    const lastAccrualTime = lastAccrual?.timestamp || null;
    const accrualStatus = lastAccrualTime 
      ? (new Date().getTime() - new Date(lastAccrualTime).getTime() < 3600000 * 2 ? 'ok' : 'stale')
      : 'never_run';

    // Get pool stats
    const { data: pools } = await supabase
      .from('pools')
      .select('tenor_days, tvl, available_liquidity');

    // Get position counts
    const { count: activePositions } = await supabase
      .from('positions')
      .select('*', { count: 'only', head: true })
      .eq('status', 'active');

    // Get recent errors
    const { data: recentErrors } = await supabase
      .from('audit_logs')
      .select('action, timestamp')
      .like('action', '%ERROR%')
      .gte('timestamp', new Date(Date.now() - 86400000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(10);

    // Relayer balance check (mock - would need actual Solana RPC call)
    const relayerBalance = 1.5; // Mock SOL balance
    const relayerStatus = relayerBalance >= 0.2 ? 'ok' : 'low';

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      cluster: network.toUpperCase(),
      rpc: {
        url: heliusApiKey ? 'Helius' : solanaRpcUrl,
        provider: heliusApiKey ? 'helius' : 'public',
      },
      relayer: {
        balance_sol: relayerBalance,
        status: relayerStatus,
        warning: relayerStatus === 'low' ? 'Relayer balance below 0.2 SOL' : null,
      },
      accrual: {
        last_run: lastAccrualTime,
        status: accrualStatus,
        warning: accrualStatus === 'stale' ? 'Yield accrual has not run in over 2 hours' : null,
      },
      pools: pools?.map(p => ({
        tenor: p.tenor_days,
        tvl: p.tvl,
        available: p.available_liquidity,
      })),
      stats: {
        active_positions: activePositions || 0,
        recent_errors: recentErrors?.length || 0,
      },
    };

    // Determine overall status
    if (relayerStatus === 'low' || accrualStatus === 'stale') {
      health.status = 'degraded';
    }

    if ((recentErrors?.length || 0) > 5) {
      health.status = 'unhealthy';
    }

    return new Response(JSON.stringify(health), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ops-health:', error);
    return new Response(JSON.stringify({ 
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
