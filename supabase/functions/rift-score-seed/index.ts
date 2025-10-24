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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    // Check operator role
    const { data: userRecord } = await supabaseClient
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single();

    if (!userRecord || !['operator', 'admin'].includes(userRecord.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden - Operator only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Seeding RIFT scores for all invoices');

    // Get all approved/listed invoices without scores
    const { data: invoices, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select('id')
      .in('status', ['approved', 'listed', 'funded'])
      .is('rift_score', null);

    if (invoiceError) throw invoiceError;

    let count = 0;
    const errors = [];

    for (const invoice of invoices || []) {
      try {
        const calcResp = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/rift-score-calc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.get('Authorization')!,
          },
          body: JSON.stringify({ entity_type: 'invoice', entity_id: invoice.id }),
        });

        if (calcResp.ok) {
          count++;
        } else {
          errors.push(invoice.id);
        }
      } catch (err) {
        console.error('Error scoring invoice:', invoice.id, err);
        errors.push(invoice.id);
      }
    }

    // Audit log
    const { data: actorRecord } = await supabaseClient
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    await supabaseClient.from('audit_logs').insert({
      actor_user_id: actorRecord?.id,
      action: 'RIFT_SCORE_SEEDED',
      entity: 'invoices',
      metadata: { count, errors: errors.length }
    });

    console.log(`Seeded ${count} invoice scores`);

    return new Response(
      JSON.stringify({ 
        success: true,
        seeded: count,
        failed: errors.length,
        errors: errors.slice(0, 10) // First 10 errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in rift-score-seed:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
