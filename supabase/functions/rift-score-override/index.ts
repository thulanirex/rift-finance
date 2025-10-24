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
      .select('id, role')
      .eq('auth_id', user.id)
      .single();

    if (!userRecord || !['operator', 'admin'].includes(userRecord.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden - Operator only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { entity_type, entity_id, delta, reason } = await req.json();

    if (delta < -10 || delta > 10) {
      return new Response(JSON.stringify({ error: 'Delta must be between -10 and 10' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Creating override:', entity_type, entity_id, delta);

    // Insert override
    const { error: insertError } = await supabaseClient
      .from('rift_score_overrides')
      .insert({
        entity_type,
        entity_id,
        delta,
        reason,
        created_by: userRecord.id,
      });

    if (insertError) throw insertError;

    // Trigger recalculation
    const recalcResp = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/rift-score-calc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization')!,
      },
      body: JSON.stringify({ entity_type, entity_id }),
    });

    if (!recalcResp.ok) {
      throw new Error('Failed to recalculate score');
    }

    const recalcData = await recalcResp.json();

    // Audit log
    await supabaseClient.from('audit_logs').insert({
      actor_user_id: userRecord.id,
      action: 'RIFT_SCORE_OVERRIDDEN',
      entity: entity_type === 'invoice' ? 'invoices' : 'organizations',
      entity_id,
      metadata: { delta, reason, new_score: recalcData.score }
    });

    console.log('Override applied and score recalculated');

    return new Response(
      JSON.stringify({ success: true, ...recalcData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in rift-score-override:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
