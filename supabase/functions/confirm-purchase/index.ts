// supabase/functions/confirm-purchase/index.ts
// Versión 5.6 — Fix definitivo: CORS completo + CAST UUID interno sin RPC

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log('[confirm-purchase v5.6] Function initialized');

Deno.serve(async (req) => {
  try {
    const origin = req.headers.get('origin') || '*';

    // --- Manejo CORS ---
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type, Authorization, apikey, Prefer',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // --- Leer body ---
    const { session_id, email } = await req.json();
    console.log('[confirm-purchase v5.6] Payload recibido:', { session_id, email });

    if (!session_id || !email) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Faltan datos requeridos (session_id o email)',
        }),
        { status: 400, headers: { 'Access-Control-Allow-Origin': origin } }
      );
    }

    // --- Cliente Supabase ---
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Validar que session_id tenga formato UUID ---
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(session_id)) {
      console.error('[confirm-purchase v5.6] session_id inválido:', session_id);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'session_id no tiene formato UUID válido.',
        }),
        { status: 400, headers: { 'Access-Control-Allow-Origin': origin } }
      );
    }

    // --- Actualizar checkout_sessions ---
    console.log('[confirm-purchase v5.6] Actualizando checkout_sessions...');
    const { error: updateError } = await supabase
      .from('checkout_sessions')
      .update({
        email_final: email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session_id); // ✅ ahora validamos antes que sea uuid

    if (updateError) {
      console.error(
        '[confirm-purchase v5.6] Error al actualizar checkout_sessions:',
        updateError.message
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error al actualizar checkout_sessions: ${updateError.message}`,
        }),
        { status: 400, headers: { 'Access-Control-Allow-Origin': origin } }
      );
    }

    console.log('[confirm-purchase v5.6] checkout_sessions actualizado correctamente.');

    // --- Insertar email en outbox_emails ---
    const { error: insertError } = await supabase.from('outbox_emails').insert([
      {
        to_email: email,
        template: 'welcome-kit',
        payload: { session_id },
        status: 'queued',
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error(
        '[confirm-purchase v5.6] Error al insertar en outbox_emails:',
        insertError.message
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error al insertar en outbox_emails: ${insertError.message}`,
        }),
        { status: 400, headers: { 'Access-Control-Allow-Origin': origin } }
      );
    }

    console.log('[confirm-purchase v5.6] Email agregado exitosamente a outbox_emails.');

    return new Response(
      JSON.stringify({
        success: true,
        message: `[confirm-purchase v5.6] OK para session_id: ${session_id}`,
      }),
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('[confirm-purchase v5.6] ERROR FATAL:', err.message);
    return new Response(
      JSON.stringify({
        success: false,
        message: `[confirm-purchase v5.6] ERROR: ${err.message}`,
      }),
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
