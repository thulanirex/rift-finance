import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VERSION = '1.0.0';
const MODE = Deno.env.get('RIFT_SCORE_MODE') || 'mock';

interface ScoreBreakdown {
  identity_integrity: number;
  financial_health: number;
  payment_behavior: number;
  trade_flow_risk: number;
  esg: number;
}

interface ScoreResult {
  total: number;
  grade: 'A' | 'B' | 'C';
  breakdown: ScoreBreakdown;
  inputs: any;
  context: any;
}

// Country risk tiers
const LOW_RISK = ['DE', 'FR', 'NL', 'BE', 'AT', 'LU', 'DK', 'SE', 'FI', 'IE'];
const MID_RISK = ['ES', 'PT', 'IT', 'CZ', 'SK', 'SI'];

// Industry ESG mapping
const ESG_MAP: Record<string, number> = {
  renewable: 90, solar: 90, wind: 90, ev: 90, cleantech: 90, saas: 90, software: 90,
  manufacturing: 65, logistics: 65, wholesale: 65, retail: 65, food: 65,
  oil: 30, gas: 30, coal: 30, tobacco: 30, gambling: 30, weapons: 30,
};

function getESGScore(industry: string | null): number {
  if (!industry) return 60;
  const lower = industry.toLowerCase();
  for (const [key, score] of Object.entries(ESG_MAP)) {
    if (lower.includes(key)) return score;
  }
  return 60;
}

function getCountryScore(country: string | null): number {
  if (!country) return 70;
  const upper = country.toUpperCase();
  if (LOW_RISK.includes(upper)) return 90;
  if (MID_RISK.includes(upper)) return 75;
  return 60;
}

function calculateRiftScore(invoice: any, org: any, history: any): ScoreResult {
  const inputs = {
    kyb_status: org.kyb_status,
    sanctions: org.sanctions_risk,
    pep: org.pep_risk,
    vat_valid: !!org.vat_number,
    amount: invoice.amount_eur,
    tenor: invoice.tenor_days,
    buyer_country: invoice.buyer_country,
    industry: org.industry,
    doc_count: history.doc_count || 0,
  };

  // A) Identity & Integrity (10%)
  let identity = 0;
  if (org.kyb_status === 'approved') identity = 100;
  else if (['in_review', 'submitted'].includes(org.kyb_status)) identity = 60;
  else identity = 0;
  
  if (org.sanctions_risk === 'hit' || org.pep_risk === 'match') identity = 0;
  if (org.vat_number && identity > 0) identity = Math.min(100, identity + 10);
  if (!org.kyb_status) identity = 50;

  // B) Financial Health (20%)
  let financial = 60;
  if (invoice.amount_eur <= 50000) financial = 80;
  else if (invoice.amount_eur <= 250000) financial = 60;
  else financial = 40;
  
  if (org.vat_number) financial = Math.min(100, financial + 10);
  if (history.doc_count >= 4) financial = Math.min(100, financial + 10);

  // C) Payment Behavior (30%)
  let payment = 65; // baseline
  if (history.avg_dpd !== undefined) {
    if (history.avg_dpd <= 0) payment = 100;
    else if (history.avg_dpd <= 10) payment = 85;
    else if (history.avg_dpd <= 30) payment = 60;
    else if (history.avg_dpd <= 60) payment = 30;
    else payment = 10;
  }
  if (MODE === 'mock' && history.avg_dpd === undefined) {
    const hash = parseInt(invoice.id.slice(0, 8), 16);
    payment = 65 + ((hash % 11) - 5);
  }
  if (history.on_time_pct >= 80) payment = Math.min(100, payment + 5);

  // D) Trade Flow Risk (20%)
  let tradeFlow = getCountryScore(invoice.buyer_country);
  if (invoice.tenor_days === 30) tradeFlow = Math.min(100, tradeFlow + 5);
  else if (invoice.tenor_days === 120) tradeFlow = Math.max(0, tradeFlow - 5);

  // E) ESG (20%)
  let esg = getESGScore(org.industry);
  if (history.has_esg_doc) esg = Math.min(100, esg + 10);

  const total = Math.round(
    identity * 0.10 +
    financial * 0.20 +
    payment * 0.30 +
    tradeFlow * 0.20 +
    esg * 0.20
  );

  const grade: 'A' | 'B' | 'C' = total >= 80 ? 'A' : total >= 60 ? 'B' : 'C';

  return {
    total,
    grade,
    breakdown: {
      identity_integrity: identity,
      financial_health: financial,
      payment_behavior: payment,
      trade_flow_risk: tradeFlow,
      esg,
    },
    inputs,
    context: { version: VERSION, mode: MODE },
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '',
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

    const { entity_type, entity_id } = await req.json();

    console.log('Calculating RIFT score for:', entity_type, entity_id);

    // Get entity data
    let invoice: any = null;
    let org: any = null;

    if (entity_type === 'invoice') {
      const { data, error } = await supabaseClient
        .from('invoices')
        .select('*, organizations(*)')
        .eq('id', entity_id)
        .single();
      if (error) throw error;
      invoice = data;
      org = data.organizations;
    } else {
      const { data, error } = await supabaseClient
        .from('organizations')
        .select('*')
        .eq('id', entity_id)
        .single();
      if (error) throw error;
      org = data;
      // For org scoring, use aggregate invoice data
      invoice = { amount_eur: 100000, tenor_days: 90, buyer_country: org.country };
    }

    // Get history data
    const { data: docs } = await supabaseClient
      .from('org_documents')
      .select('id, doc_type')
      .eq('org_id', org.id);

    const history = {
      doc_count: docs?.length || 0,
      has_esg_doc: docs?.some((d: any) => d.doc_type === 'esg_policy') || false,
      avg_dpd: undefined,
      on_time_pct: 0,
    };

    // Calculate score
    const result = calculateRiftScore(invoice, org, history);

    // Check for override
    const { data: override } = await supabaseClient
      .from('rift_score_overrides')
      .select('delta')
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let finalScore = result.total;
    if (override?.delta) {
      finalScore = Math.max(0, Math.min(100, result.total + override.delta));
    }

    const finalGrade: 'A' | 'B' | 'C' = finalScore >= 80 ? 'A' : finalScore >= 60 ? 'B' : 'C';

    // Upsert score
    const { error: upsertError } = await supabaseClient
      .from('rift_scores')
      .upsert({
        entity_type,
        entity_id,
        version: VERSION,
        total_score: finalScore,
        grade: finalGrade,
        breakdown: result.breakdown,
        inputs_snapshot: result.inputs,
        calc_context: { ...result.context, override_delta: override?.delta || 0 },
      }, { onConflict: 'entity_type,entity_id,version' });

    if (upsertError) throw upsertError;

    // Update invoice with score if applicable
    if (entity_type === 'invoice') {
      await supabaseClient
        .from('invoices')
        .update({
          rift_score: finalScore,
          rift_grade: finalGrade,
        })
        .eq('id', entity_id);
    } else {
      await supabaseClient
        .from('organizations')
        .update({ kyb_score: finalScore })
        .eq('id', entity_id);
    }

    // Audit log
    const { data: userRecord } = await supabaseClient
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle();

    await supabaseClient.from('audit_logs').insert({
      actor_user_id: userRecord?.id,
      action: 'RIFT_SCORE_COMPUTED',
      entity: entity_type === 'invoice' ? 'invoices' : 'organizations',
      entity_id,
      metadata: { score: finalScore, grade: finalGrade, version: VERSION }
    });

    console.log('RIFT score calculated:', finalScore, finalGrade);

    return new Response(
      JSON.stringify({ 
        entity_type,
        entity_id,
        score: finalScore,
        grade: finalGrade,
        version: VERSION,
        breakdown: result.breakdown
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in rift-score-calc:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});