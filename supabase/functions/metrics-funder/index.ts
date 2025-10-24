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
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (userRecordError || !userRecord) {
      console.error('User record error:', userRecordError);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get active positions summary
    const { data: positions } = await supabase
      .from('positions')
      .select('amount_funded, accrued_yield, expected_yield, pool_id, created_at')
      .eq('funder_user_id', userRecord.id)
      .eq('status', 'active');

    const totalPrincipal = positions?.reduce((sum, p) => sum + parseFloat(p.amount_funded), 0) || 0;
    const totalAccrued = positions?.reduce((sum, p) => sum + parseFloat(p.accrued_yield), 0) || 0;
    const totalExpected = positions?.reduce((sum, p) => sum + parseFloat(p.expected_yield), 0) || 0;

    // Allocations by tenor (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentPositions } = await supabase
      .from('positions')
      .select('pool_id, amount_funded, pools!inner(tenor_days)')
      .eq('funder_user_id', userRecord.id)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const allocationsByTenor = recentPositions?.reduce((acc: any, p: any) => {
      const tenor = p.pools.tenor_days;
      if (!acc[tenor]) {
        acc[tenor] = { tenor, total: 0 };
      }
      acc[tenor].total += parseFloat(p.amount_funded);
      return acc;
    }, {});

    // Accrual timeseries (last 30 days, daily rollup)
    const { data: ledgerEntries } = await supabase
      .from('ledger_entries')
      .select('created_at, amount')
      .eq('user_id', userRecord.id)
      .eq('ref_type', 'position')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group by date
    const accrualTimeseries: any[] = [];
    let runningTotal = 0;
    const dailyMap = new Map();

    ledgerEntries?.forEach(entry => {
      const date = new Date(entry.created_at).toISOString().split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, 0);
      }
      dailyMap.set(date, dailyMap.get(date) + parseFloat(entry.amount));
    });

    dailyMap.forEach((amount, date) => {
      runningTotal += amount;
      accrualTimeseries.push({ date, total: runningTotal });
    });

    // Exposure by country (from linked invoices)
    const { data: invoicePositions } = await supabase
      .from('positions')
      .select('invoice_id, amount_funded, invoices!inner(buyer_country)')
      .eq('funder_user_id', userRecord.id)
      .eq('status', 'active')
      .not('invoice_id', 'is', null);

    const exposureByCountry = invoicePositions?.reduce((acc: any, p: any) => {
      const country = p.invoices?.buyer_country || 'Unknown';
      if (!acc[country]) {
        acc[country] = { country, amount: 0 };
      }
      acc[country].amount += parseFloat(p.amount_funded);
      return acc;
    }, {});

    return new Response(JSON.stringify({
      summary: {
        total_principal: totalPrincipal,
        total_accrued: totalAccrued,
        total_expected: totalExpected,
        active_positions: positions?.length || 0,
      },
      allocations_by_tenor: Object.values(allocationsByTenor || {}),
      accrual_timeseries: accrualTimeseries,
      exposure_by_country: Object.values(exposureByCountry || {}),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in metrics-funder:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
