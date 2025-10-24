import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getAuthenticatedUser } from '../_shared/guards.ts';
import { screenSanctions } from '../_shared/adapters.ts';

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
    
    const { organization, beneficialOwners, orgDocuments } = await req.json();

    if (!userRecord.org_id) {
      throw new Error('User must be associated with an organization');
    }

    // Update organization with KYB details
    const { error: orgError } = await supabaseClient
      .from('organizations')
      .update({
        ...organization,
        kyb_status: 'submitted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userRecord.org_id);

    if (orgError) throw orgError;

    // Insert beneficial owners
    if (beneficialOwners && beneficialOwners.length > 0) {
      const ownersToInsert = beneficialOwners.map((owner: any) => ({
        org_id: userRecord.org_id,
        ...owner,
      }));

      const { error: ownersError } = await supabaseClient
        .from('beneficial_owners')
        .insert(ownersToInsert);

      if (ownersError) throw ownersError;
    }

    // Insert org documents
    if (orgDocuments && orgDocuments.length > 0) {
      const docsToInsert = orgDocuments.map((doc: any) => ({
        org_id: userRecord.org_id,
        uploaded_by: userRecord.id,
        ...doc,
      }));

      const { error: docsError } = await supabaseClient
        .from('org_documents')
        .insert(docsToInsert);

      if (docsError) throw docsError;

      // Audit log for each document
      for (const doc of orgDocuments) {
        await supabaseClient.from('audit_logs').insert({
          action: 'ORG_DOC_UPLOADED',
          entity: 'org_documents',
          actor_user_id: userRecord.id,
          metadata: { doc_type: doc.doc_type, file_hash: doc.file_hash },
        });
      }
    }

    // Create KYB case
    const provider = Deno.env.get('GATE_MODE') === 'live' ? 'sumsub' : 'mock';
    const checklist: any = {};

    // Run automated checks
    let kybScore = 0;

    // VAT check
    if (organization.vat_number) {
      // Mock VAT validation
      checklist.vat = { valid: true, name: organization.legal_name };
      kybScore += 40;
    }

    // Sanctions check for organization
    const orgSanctionsResult = await screenSanctions({
      entityName: organization.legal_name,
      country: organization.registration_country,
    });
    
    checklist.orgSanctions = orgSanctionsResult;
    if (orgSanctionsResult.isClean) kybScore += 20;

    // Sanctions check for each beneficial owner
    if (beneficialOwners && beneficialOwners.length > 0) {
      const ownerChecks = [];
      for (const owner of beneficialOwners) {
        const ownerSanctionsResult = await screenSanctions({
          firstName: owner.first_name,
          lastName: owner.last_name,
          dob: owner.dob,
        });
        ownerChecks.push(ownerSanctionsResult);
      }
      checklist.ownerSanctions = ownerChecks;
      if (ownerChecks.every((c) => c.isClean)) kybScore += 30;
    }

    // Documents completeness check
    const requiredDocTypes = ['certificate_of_incorporation', 'shareholders_register', 'proof_of_address'];
    const uploadedDocTypes = orgDocuments?.map((d: any) => d.doc_type) || [];
    const docsComplete = requiredDocTypes.every((doc) => uploadedDocTypes.includes(doc));
    
    checklist.docsComplete = docsComplete;
    if (docsComplete) kybScore += 10;

    // Create KYB case
    const { data: kybCase, error: caseError } = await supabaseClient
      .from('kyb_cases')
      .insert({
        org_id: userRecord.org_id,
        submitted_by: userRecord.id,
        status: 'in_review',
        provider,
        checklist: { ...checklist, score: kybScore },
      })
      .select()
      .single();

    if (caseError) throw caseError;

    // Update organization risk scores
    await supabaseClient
      .from('organizations')
      .update({
        kyb_score: kybScore,
        kyb_status: 'in_review',
        sanctions_risk: orgSanctionsResult.isClean ? 'clear' : 'hit',
      })
      .eq('id', userRecord.org_id);

    // Audit log
    await supabaseClient.from('audit_logs').insert({
      action: 'KYB_SUBMITTED',
      entity: 'kyb_cases',
      entity_id: kybCase.id,
      actor_user_id: userRecord.id,
      metadata: { score: kybScore },
    });

    return new Response(
      JSON.stringify({
        success: true,
        caseId: kybCase.id,
        status: 'in_review',
        score: kybScore,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in kyb-submit:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});