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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body (frontend sends filters via POST body)
    const body = await req.json();
    const grade = body.grade || null;
    const tenor = body.tenor || null;
    const country = body.country || null;
    const amountBand = body.amount_band || null;
    const page = parseInt(body.page || '1');
    const limit = parseInt(body.limit || '20');

    console.log('Market invoices query:', { grade, tenor, country, amountBand, page, limit });

    // Build query
    let query = supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        amount_eur,
        due_date,
        tenor_days,
        currency,
        buyer_name,
        buyer_country,
        counterparty,
        rift_score,
        rift_grade,
        status,
        created_at
      `)
      .eq('status', 'listed');

    // Apply filters
    if (grade && grade !== 'All') {
      if (grade === 'AB') {
        query = query.in('rift_grade', ['A', 'B']);
      } else {
        query = query.eq('rift_grade', grade);
      }
    }

    if (tenor && tenor !== 'Any') {
      query = query.eq('tenor_days', parseInt(tenor));
    }

    if (country) {
      query = query.eq('buyer_country', country);
    }

    if (amountBand) {
      if (amountBand === 'small') {
        query = query.lte('amount_eur', 50000);
      } else if (amountBand === 'medium') {
        query = query.gte('amount_eur', 50000).lte('amount_eur', 250000);
      } else if (amountBand === 'large') {
        query = query.gte('amount_eur', 250000);
      }
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: invoices, error: invoicesError, count } = await query;

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch invoices' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get pool APRs for yield calculation
    const { data: pools } = await supabase
      .from('pools')
      .select('tenor_days, apr');

    const poolMap = new Map(pools?.map(p => [p.tenor_days, p.apr]) || []);

    // Enrich invoices with pool APR and projected yield
    const enrichedInvoices = invoices?.map(invoice => {
      const poolApr = poolMap.get(invoice.tenor_days) || 0;
      const expectedYield = invoice.amount_eur * poolApr * (invoice.tenor_days / 365);

      return {
        ...invoice,
        pool_apr: poolApr,
        expected_yield: expectedYield,
      };
    });

    return new Response(JSON.stringify({
      invoices: enrichedInvoices,
      total: count,
      page,
      limit,
      pages: count ? Math.ceil(count / limit) : 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in market-invoices:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
