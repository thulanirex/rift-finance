import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    const { data: userData, error: userRecordError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_id', user.id)
      .single();

    if (userRecordError || !userData) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { invoice_id, amount_eur, note } = await req.json();

    if (!invoice_id || !amount_eur || amount_eur <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Marking repayment:', { invoice_id, amount_eur, note });

    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice error:', invoiceError);
      return new Response(JSON.stringify({ error: 'Invoice not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate invoice status
    if (!['funded', 'listed'].includes(invoice.status)) {
      return new Response(JSON.stringify({ 
        error: 'Invoice must be funded or listed to mark repayment' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get pool by tenor
    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .select('*')
      .eq('tenor_days', invoice.tenor_days)
      .single();

    if (poolError || !pool) {
      console.error('Pool error:', poolError);
      return new Response(JSON.stringify({ error: 'Matching pool not found' }), {
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
      return new Response(JSON.stringify({ 
        error: 'No active positions in this pool' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate total active principal
    const totalPrincipal = positions.reduce((sum, p) => sum + parseFloat(p.amount_funded), 0);

    // Distribute pro-rata to each position
    const distributions = [];
    let closedCount = 0;

    for (const position of positions) {
      const share = parseFloat(position.amount_funded) / totalPrincipal;
      const distribution = amount_eur * share;
      
      // Split distribution between yield and principal return
      const remainingYield = parseFloat(position.expected_yield) - parseFloat(position.accrued_yield);
      const yieldPortion = Math.min(distribution, remainingYield);
      const principalReturn = distribution - yieldPortion;

      const newAccruedYield = parseFloat(position.accrued_yield) + yieldPortion;
      
      // Check if position should close (yield met + principal returned)
      const yieldMet = Math.abs(newAccruedYield - parseFloat(position.expected_yield)) < 0.01;
      const shouldClose = yieldMet && principalReturn >= 0;

      // Update position
      await supabase
        .from('positions')
        .update({
          accrued_yield: newAccruedYield,
          status: shouldClose ? 'closed' : 'active',
          closed_at: shouldClose ? new Date().toISOString() : null,
        })
        .eq('id', position.id);

      // Create ledger entry for this distribution
      await supabase.from('ledger_entries').insert({
        user_id: position.funder_user_id,
        pool_id: pool.id,
        ref_type: 'position',
        ref_id: position.id,
        amount: distribution,
        notes: note || `Repayment distribution from invoice #${invoice.invoice_number}`,
        metadata: {
          repayment_distribution: true,
          invoice_id,
          share,
          yield_portion: yieldPortion,
          principal_return: principalReturn,
          closed: shouldClose,
        },
      });

      distributions.push({
        position_id: position.id,
        funder_user_id: position.funder_user_id,
        distribution,
        yield_portion: yieldPortion,
        principal_return: principalReturn,
        closed: shouldClose,
      });

      if (shouldClose) closedCount++;
    }

    // Create pool-level credit ledger entry
    await supabase.from('ledger_entries').insert({
      pool_id: pool.id,
      ref_type: 'repayment',
      ref_id: invoice_id,
      amount: amount_eur,
      notes: note || `Repayment for invoice #${invoice.invoice_number}`,
      metadata: {
        pool_credit: true,
        invoice_id,
        tenor: invoice.tenor_days,
        distributed_to: distributions.length,
        closed_positions: closedCount,
      },
    });

    // Update pool available liquidity
    await supabase
      .from('pools')
      .update({
        available_liquidity: (pool.available_liquidity || 0) + amount_eur,
      })
      .eq('id', pool.id);

    // Update invoice status
    await supabase
      .from('invoices')
      .update({ status: 'repaid' })
      .eq('id', invoice_id);

    // Audit logs
    await supabase.from('audit_logs').insert([
      {
        actor_user_id: userData.id,
        action: 'INVOICE_REPAID',
        entity: 'invoice',
        entity_id: invoice_id,
        metadata: { amount_eur, note },
      },
      {
        actor_user_id: userData.id,
        action: 'POOL_REPAYMENT_CREDIT',
        entity: 'pool',
        entity_id: pool.id,
        metadata: {
          invoice_id,
          amount_eur,
          distributions: distributions.length,
          closed_positions: closedCount,
        },
      },
    ]);

    console.log('Repayment marked:', { invoice_id, amount_eur, distributions: distributions.length });

    return new Response(JSON.stringify({
      success: true,
      invoice_id,
      amount_eur,
      pool_id: pool.id,
      distributions,
      closed_positions: closedCount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in repayment-mark:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});