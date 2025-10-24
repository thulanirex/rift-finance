import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sha256(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get auth header for user auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUserClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user } } = await supabaseUserClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const orgId = formData.get('org_id') as string;
    const amountEur = parseFloat(formData.get('amount_eur') as string);
    const dueDate = formData.get('due_date') as string;
    const counterparty = formData.get('counterparty') as string;
    const tenorDays = parseInt(formData.get('tenor_days') as string);

    if (!file || !orgId || !amountEur || !dueDate || !counterparty || !tenorDays) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user belongs to org
    const { data: userData } = await supabaseClient
      .from('users')
      .select('org_id, id, role')
      .eq('auth_id', user.id)
      .single();

    if (!userData || (userData.org_id !== orgId && !['operator', 'admin'].includes(userData.role))) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Uploading invoice for org:', orgId);

    // Validate file type
    if (!file.type.includes('pdf')) {
      return new Response(JSON.stringify({ error: 'Only PDF files are allowed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File size must be less than 10MB' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Read file and compute hash
    const fileBuffer = await file.arrayBuffer();
    const fileHash = await sha256(fileBuffer);

    // Upload to private storage bucket
    const fileName = `${orgId}/${crypto.randomUUID()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('invoices-private')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Failed to upload file to storage');
    }

    console.log('File uploaded to storage:', uploadData.path);

    // Store file path (not public URL)
    const fileUrl = uploadData.path;

    // Create invoice record
    const { data: invoice, error: insertError } = await supabaseClient
      .from('invoices')
      .insert({
        org_id: orgId,
        amount_eur: amountEur,
        due_date: dueDate,
        counterparty: counterparty,
        tenor_days: tenorDays,
        file_url: fileUrl,
        file_hash: fileHash,
        status: 'draft'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Audit log
    await supabaseClient.from('audit_logs').insert({
      actor_user_id: userData.id,
      action: 'INVOICE_UPLOADED',
      entity: 'invoices',
      entity_id: invoice.id,
      metadata: {
        file_name: file.name,
        file_hash: fileHash,
        amount_eur: amountEur
      }
    });

    console.log('Invoice uploaded:', invoice.id);

    return new Response(
      JSON.stringify({ 
        invoice_id: invoice.id,
        file_hash: fileHash,
        file_url: fileUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in invoice-upload:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});