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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: userData, error: roleError } = await supabase
      .from('users')
      .select('role, id')
      .eq('auth_id', user.id)
      .single();

    if (roleError || !userData || !['operator', 'admin'].includes(userData.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { invoice_id, event, amount, note } = await req.json();

    if (!invoice_id || !event || !['bind', 'claim_opened', 'claim_paid'].includes(event)) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Creating insurance event:', { invoice_id, event, amount, note });

    // Create insurance event
    const { data: insuranceEvent, error: eventError } = await supabase
      .from('insurance_events')
      .insert({
        invoice_id,
        event,
        amount,
        note,
        created_by: userData.id,
      })
      .select()
      .single();

    if (eventError) {
      console.error('Insurance event error:', eventError);
      return new Response(JSON.stringify({ error: 'Failed to create event' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle event-specific logic
    if (event === 'bind') {
      // Tag invoice as insured
      await supabase
        .from('invoices')
        .update({ 
          // Store in metadata for now
        })
        .eq('id', invoice_id);
    } else if (event === 'claim_paid' && amount) {
      // Credit pool (similar to repayment)
      const { data: invoice } = await supabase
        .from('invoices')
        .select('tenor_days')
        .eq('id', invoice_id)
        .single();

      if (invoice) {
        const { data: pool } = await supabase
          .from('pools')
          .select('id')
          .eq('tenor_days', invoice.tenor_days)
          .single();

        if (pool) {
          await supabase.from('ledger_entries').insert({
            pool_id: pool.id,
            ref_type: 'insurance',
            ref_id: insuranceEvent.id,
            amount,
            notes: `Insurance claim paid: ${note || ''}`,
            metadata: { invoice_id, event: 'claim_paid' },
          });

          await supabase
            .from('pools')
            .update({
              available_liquidity: supabase.raw(`available_liquidity + ${amount}`),
            })
            .eq('id', pool.id);

          await supabase
            .from('invoices')
            .update({ status: 'repaid' }) // Mark as repaid by insurer
            .eq('id', invoice_id);
        }
      }
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      actor_user_id: userData.id,
      action: 'INSURANCE_EVENT',
      entity: 'invoice',
      entity_id: invoice_id,
      metadata: { event, amount, note },
    });

    return new Response(JSON.stringify({
      success: true,
      event: insuranceEvent,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in insurance-event:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
