// supabase/functions/confirm-purchase/index.ts
// Versión v5.0 — "Bala de Plata sin RPC" (100% JS, sin dependencias SQL)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 🚀 Servidor principal
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { session_id, email } = await req.json();
    console.log('[confirm-purchase] Payload recibido:', { session_id, email });

    if (!session_id || !email) {
      throw new Error('Faltan session_id o email.');
    }

    // Validar formato UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(session_id)) {
      throw new Error(`El session_id no tiene formato UUID válido: ${session_id}`);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1️⃣ Buscar la sesión de checkout
    const { data: session, error: findErr } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('id', session_id.toString())
      .single();

    if (findErr || !session) {
      throw new Error('No se encontró la sesión de checkout con ese ID.');
    }

    console.log('[confirm-purchase] Sesión encontrada:', session);

    // 2️⃣ Actualizar email_final en checkout_sessions
    const { error: updateErr } = await supabase
      .from('checkout_sessions')
      .update({
        email_final: email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session_id.toString());

    if (updateErr) {
      throw new Error(`Error al actualizar checkout_sessions: ${updateErr.message}`);
    }

    console.log('[confirm-purchase] Email actualizado correctamente en checkout_sessions.');

    // 3️⃣ Encolar email en outbox_emails
    const { error: insertErr } = await supabase.from('outbox_emails').insert({
      to_email: email,
      status: 'queued',
      template: 'kit-7-dias',
      payload: { session_id },
      created_at: new Date().toISOString(),
    });

    if (insertErr) {
      throw new Error(`Error al insertar en outbox_emails: ${insertErr.message}`);
    }

    console.log('[confirm-purchase] Email encolado exitosamente.');

    // 4️⃣ Respuesta final
    return new Response(
      JSON.stringify({
        success: true,
        message: `[confirm-purchase][v5.0 sin RPC] OK para session_id: ${session_id}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    console.error('[confirm-purchase] ERROR:', err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
