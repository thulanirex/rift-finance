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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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
    const { data: kybCase, error: caseError } = await supabaseClient
      .from('kyb_cases')
      .select('org_id')
      .eq('id', caseId)
      .single();

    if (caseError) throw caseError;

    // Update case
    const { error: updateCaseError } = await supabaseClient
      .from('kyb_cases')
      .update({
        status: decision,
        decision_notes: notes,
        decided_at: new Date().toISOString(),
        decided_by: userRecord.id,
      })
      .eq('id', caseId);

    if (updateCaseError) throw updateCaseError;

    // Update organization KYB status
    const kybStatus = decision === 'approved' ? 'approved' : 'rejected';
    const { error: updateOrgError } = await supabaseClient
      .from('organizations')
      .update({ kyb_status: kybStatus })
      .eq('id', kybCase.org_id);

    if (updateOrgError) throw updateOrgError;

    // If approved, optionally set users gate status to verified
    if (decision === 'approved') {
      const { error: gateError } = await supabaseClient
        .from('users')
        .update({
          gate_status: 'verified',
          gate_updated_at: new Date().toISOString(),
        })
        .eq('org_id', kybCase.org_id);

      if (gateError) console.error('Error updating gate status:', gateError);
    }

    // Audit log
    await supabaseClient.from('audit_logs').insert({
      action: decision === 'approved' ? 'KYB_APPROVED' : 'KYB_REJECTED',
      entity: 'kyb_cases',
      entity_id: caseId,
      actor_user_id: userRecord.id,
      metadata: { notes, org_id: kybCase.org_id },
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in kyb-decision:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});