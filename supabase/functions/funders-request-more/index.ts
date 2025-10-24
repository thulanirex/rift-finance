import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getAuthenticatedUser } from '../_shared/guards.ts';

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { user, userRecord } = await getAuthenticatedUser(req, supabaseClient);

    // Check if user is operator or admin
    if (!['operator', 'admin'].includes(userRecord.role)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { caseId, missing, message } = await req.json();

    // Get the case
    const { data: funderCase, error: caseError } = await supabaseClient
      .from('funder_cases')
      .select('user_id')
      .eq('id', caseId)
      .single();

    if (caseError) throw caseError;

    // Update case status
    const { error: updateError } = await supabaseClient
      .from('funder_cases')
      .update({
        status: 'awaiting_docs',
        decision_notes: message,
      })
      .eq('id', caseId);

    if (updateError) throw updateError;

    // Audit log
    await supabaseClient.from('audit_logs').insert({
      action: 'FUNDER_MORE_INFO_REQUESTED',
      entity: 'funder_cases',
      entity_id: caseId,
      actor_user_id: userRecord.id,
      metadata: { missing, message, target_user_id: funderCase.user_id },
    });

    // In a real implementation, send email notification here

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in funders-request-more:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});