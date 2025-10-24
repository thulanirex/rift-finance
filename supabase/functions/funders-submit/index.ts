import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getAuthenticatedUser } from '../_shared/guards.ts';
import { screeningAdapter } from '../_shared/adapters.ts';

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
    
    const { profile, documents, bankAccount } = await req.json();

    // Insert or update funder profile
    const { data: funderProfile, error: profileError } = await supabaseClient
      .from('funder_profiles')
      .upsert({
        user_id: userRecord.id,
        ...profile,
        status: 'submitted',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // Insert documents
    if (documents && documents.length > 0) {
      const docsToInsert = documents.map((doc: any) => ({
        user_id: userRecord.id,
        ...doc,
      }));

      const { error: docsError } = await supabaseClient
        .from('funder_documents')
        .insert(docsToInsert);

      if (docsError) throw docsError;

      // Audit log for each document
      for (const doc of documents) {
        await supabaseClient.from('audit_logs').insert({
          action: 'FUNDER_DOC_UPLOADED',
          entity: 'funder_documents',
          actor_user_id: userRecord.id,
          metadata: { doc_type: doc.doc_type, file_hash: doc.file_hash },
        });
      }
    }

    // Insert bank account if provided
    if (bankAccount) {
      await supabaseClient
        .from('bank_accounts')
        .insert({
          user_id: userRecord.id,
          ...bankAccount,
        });
    }

    // Create funder case
    const caseType = profile.type === 'individual' ? 'kyc_individual' : 'kyb_entity';
    const provider = Deno.env.get('GATE_MODE') === 'live' ? 'sumsub' : 'mock';

    const { data: funderCase, error: caseError } = await supabaseClient
      .from('funder_cases')
      .insert({
        user_id: userRecord.id,
        org_id: profile.type === 'entity' ? userRecord.org_id : null,
        type: caseType,
        status: 'open',
        provider,
        checklist: {},
      })
      .select()
      .single();

    if (caseError) throw caseError;

    // Run automated checks
    let score = 0;
    const checkResults: any = {};

    // Sanctions check
    const name = profile.type === 'individual' 
      ? `${profile.first_name} ${profile.last_name}`
      : profile.legal_name || 'Unknown Entity';
    const org = profile.type === 'entity' ? profile.legal_name || 'Unknown' : '';
    
    const sanctionsResult = await screeningAdapter.run(name, org, false);
    
    checkResults.sanctions = sanctionsResult;
    const isClean = !sanctionsResult.sanctions_hit && !sanctionsResult.pep;
    if (isClean) score += 40;

    // Documents completeness check
    const requiredDocs = profile.type === 'individual' 
      ? ['passport', 'proof_of_address']
      : ['company_registry', 'board_resolution', 'authorized_signatory'];
    
    const uploadedDocTypes = documents?.map((d: any) => d.doc_type) || [];
    const docsComplete = requiredDocs.every((doc) => uploadedDocTypes.includes(doc));
    
    checkResults.docsComplete = docsComplete;
    if (docsComplete) score += 20;

    // Tax self-cert check
    if (profile.fatca_crs_self_cert && profile.tin) {
      checkResults.taxCert = true;
      score += 20;
    }

    // VAT check for entities
    if (profile.type === 'entity' && profile.vat_number) {
      // Mock VAT validation for now
      checkResults.vatValid = true;
      score += 20;
    }

    // Update case with checklist and score
    await supabaseClient
      .from('funder_cases')
      .update({
        status: 'in_review',
        checklist: { ...checkResults, score },
      })
      .eq('id', funderCase.id);

    // Audit log
    await supabaseClient.from('audit_logs').insert({
      action: 'FUNDER_SUBMITTED',
      entity: 'funder_cases',
      entity_id: funderCase.id,
      actor_user_id: userRecord.id,
      metadata: { type: caseType, score },
    });

    return new Response(
      JSON.stringify({
        success: true,
        caseId: funderCase.id,
        status: 'in_review',
        score,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in funders-submit:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});