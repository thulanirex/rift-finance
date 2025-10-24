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

    const mintEnabled = Deno.env.get('MINT_CNFT_ENABLED') === 'true';
    if (!mintEnabled) {
      return new Response(JSON.stringify({ error: 'cNFT minting is disabled' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    // Verify operator/admin role
    const { data: userData, error: roleError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_id', user.id)
      .single();

    if (roleError || !userData || !['operator', 'admin'].includes(userData.role)) {
      console.error('Role check failed:', roleError);
      return new Response(JSON.stringify({ error: 'Forbidden - operator or admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { invoice_id } = await req.json();

    if (!invoice_id) {
      return new Response(JSON.stringify({ error: 'Missing invoice_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get invoice
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .single();

    if (fetchError || !invoice) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify status is approved
    if (invoice.status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Invoice must be approved before minting' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if already minted
    if (invoice.minted_at || invoice.mint_tx) {
      return new Response(JSON.stringify({ error: 'Invoice already minted' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Preparing cNFT metadata for invoice:', invoice_id);

    // Build metadata for compressed NFT
    const metadata = {
      name: `RIFT Invoice #${invoice.invoice_number || invoice.id.slice(0, 8)}`,
      symbol: "RIFT-INV",
      description: "EUR-denominated invoice tokenized for transparency (MVP devnet).",
      attributes: [
        { trait_type: "amount_eur", value: invoice.amount_eur.toString() },
        { trait_type: "due_date", value: invoice.due_date },
        { trait_type: "tenor_days", value: invoice.tenor_days.toString() },
        { trait_type: "buyer_country", value: invoice.buyer_country },
        { trait_type: "file_hash_sha256", value: invoice.file_hash },
        { trait_type: "invoice_id", value: invoice_id },
        { trait_type: "org_id", value: invoice.org_id },
      ],
    };

    console.log('cNFT Metadata:', metadata);

    // For MVP: Mock the Bubblegum minting process
    // In production, this would use @metaplex-foundation/mpl-bubblegum
    // and call the relayer-submit function with a proper transaction
    
    const mockTxSignature = `MOCK-DEVNET-${crypto.randomUUID()}`;
    const mockLeafId = `LEAF-${crypto.randomUUID()}`;
    const mockCollection = invoice.cnft_collection || `COLLECTION-${crypto.randomUUID()}`;

    console.log('Mock cNFT minting:', {
      txSignature: mockTxSignature,
      leafId: mockLeafId,
      collection: mockCollection,
    });

    // Update invoice with mint details
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'listed',
        minted_at: new Date().toISOString(),
        mint_tx: mockTxSignature,
        cnft_leaf_id: mockLeafId,
        cnft_collection: mockCollection,
      })
      .eq('id', invoice_id);

    if (updateError) throw updateError;

    // Audit log
    await supabase.from('audit_logs').insert({
      actor_user_id: userData.id,
      action: 'INVOICE_CNFT_MINTED',
      entity: 'invoices',
      entity_id: invoice_id,
      metadata: {
        mint_tx: mockTxSignature,
        cnft_leaf_id: mockLeafId,
        cnft_collection: mockCollection,
        invoice_number: invoice.invoice_number,
        amount_eur: invoice.amount_eur,
      },
    });

    console.log('Invoice cNFT minted successfully:', invoice_id);

    return new Response(JSON.stringify({ 
      success: true,
      invoice_id,
      mint_tx: mockTxSignature,
      cnft_leaf_id: mockLeafId,
      cnft_collection: mockCollection,
      explorer_url: `https://explorer.solana.com/tx/${mockTxSignature}?cluster=devnet`,
      status: 'listed',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in invoice-mint-cnft:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
