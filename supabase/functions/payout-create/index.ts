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
      .select('role, id')
      .eq('auth_id', user.id)
      .single();

    if (roleError || !userData || !['operator', 'admin'].includes(userData.role)) {
      console.error('Role check failed:', roleError);
      return new Response(JSON.stringify({ error: 'Forbidden - operator or admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { invoice_id, discount_rate_bps = 200, fees_eur = 0, simulate_chain = true } = await req.json();

    if (!invoice_id) {
      return new Response(JSON.stringify({ error: 'Missing invoice_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Creating payout:', { invoice_id, discount_rate_bps, fees_eur, simulate_chain });

    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, org:organizations(*)')
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice error:', invoiceError);
      return new Response(JSON.stringify({ error: 'Invoice not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate invoice is funded
    if (invoice.status !== 'funded') {
      return new Response(JSON.stringify({ error: 'Invoice must be funded to create payout' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate net amount
    const grossAmount = parseFloat(invoice.amount_eur);
    const discountAmount = grossAmount * (discount_rate_bps / 10000);
    const netAmount = grossAmount - discountAmount - fees_eur;

    // Generate mock txSig if simulating chain
    let txSig = null;
    if (simulate_chain) {
      txSig = `SIM_PAYOUT${Date.now()}${Math.random().toString(36).substring(2, 15)}`;
      console.log('[SIM] Generated payout tx:', txSig);
    }

    // Create payout
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .insert({
        invoice_id,
        org_id: invoice.org_id,
        gross_amount: grossAmount,
        discount_rate_bps,
        fees_eur,
        net_amount: netAmount,
        status: 'paid',
        tx_sig: txSig,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (payoutError) {
      console.error('Payout insert error:', payoutError);
      return new Response(JSON.stringify({ error: 'Failed to create payout', details: payoutError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update invoice
    await supabase
      .from('invoices')
      .update({
        payout_id: payout.id,
        payout_status: 'paid',
      })
      .eq('id', invoice_id);

    // Create ledger entry (negative from pool's available)
    await supabase.from('ledger_entries').insert({
      org_id: invoice.org_id,
      ref_type: 'payout',
      ref_id: payout.id,
      amount: -netAmount, // Negative because funds leave pool
      tx_sig: txSig,
      notes: `Payout for invoice #${invoice.invoice_number}`,
      metadata: {
        invoice_id,
        gross_amount: grossAmount,
        discount_rate_bps,
        fees_eur,
        net_amount: netAmount,
        simulate_chain,
      },
    });

    // Audit logs
    await supabase.from('audit_logs').insert([
      {
        actor_user_id: userData.id,
        action: 'PAYOUT_CREATED',
        entity: 'payout',
        entity_id: payout.id,
        metadata: { invoice_id, gross_amount: grossAmount, net_amount: netAmount },
      },
      {
        actor_user_id: userData.id,
        action: 'PAYOUT_PAID',
        entity: 'payout',
        entity_id: payout.id,
        metadata: { tx_sig: txSig, paid_at: payout.paid_at },
      },
    ]);

    console.log('Payout created:', payout.id);

    // TODO: Generate PDF receipt and email seller (Stage 8.3)
    const receiptUrl = `#receipt-${payout.id}`; // Placeholder

    return new Response(JSON.stringify({
      success: true,
      payout: {
        id: payout.id,
        invoice_number: invoice.invoice_number,
        gross_amount: grossAmount,
        discount_rate_bps,
        fees_eur,
        net_amount: netAmount,
        tx_sig: txSig,
        receipt_url: receiptUrl,
        mode: simulate_chain ? 'SIM' : 'LIVE',
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in payout-create:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
