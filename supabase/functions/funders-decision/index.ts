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

    const { caseId, decision, notes } = await req.json();

    // Get the case
    const { data: funderCase, error: caseError } = await supabaseClient
      .from('funder_cases')
      .select('*, funder_profiles!inner(user_id)')
      .eq('id', caseId)
      .single();

    if (caseError) throw caseError;

    // Update case
    const { error: updateCaseError } = await supabaseClient
      .from('funder_cases')
      .update({
        status: decision,
        decision_notes: notes,
        decided_at: new Date().toISOString(),
        decided_by: userRecord.id,
      })
      .eq('id', caseId);

    if (updateCaseError) throw updateCaseError;

    // Update profile status
    const profileStatus = decision === 'approved' ? 'approved' : 'rejected';
    const { error: updateProfileError } = await supabaseClient
      .from('funder_profiles')
      .update({ status: profileStatus })
      .eq('user_id', funderCase.user_id);

    if (updateProfileError) throw updateProfileError;

    // If approved, set gate status to verified
    if (decision === 'approved') {
      const { error: gateError } = await supabaseClient
        .from('users')
        .update({
          gate_status: 'verified',
          gate_updated_at: new Date().toISOString(),
        })
        .eq('id', funderCase.user_id);

      if (gateError) throw gateError;

      // Optionally mint VeriPass SBT here
      // For MVP, we'll skip the actual minting
    }

    // Audit log
    await supabaseClient.from('audit_logs').insert({
      action: decision === 'approved' ? 'FUNDER_APPROVED' : 'FUNDER_REJECTED',
      entity: 'funder_cases',
      entity_id: caseId,
      actor_user_id: userRecord.id,
      metadata: { notes, target_user_id: funderCase.user_id },
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in funders-decision:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});