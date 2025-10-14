// supabase/functions/confirm-purchase/index.ts
// Versión 5.7 — Fix real CAST UUID y feedback visual 100%

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log('[confirm-purchase v5.7] Function initialized');

Deno.serve(async (req) => {
  try {
    const origin = req.headers.get('origin') || '*';

    // --- CORS preflight ---
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
    console.log('[confirm-purchase v5.7] Payload recibido:', { session_id, email });

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

    // --- Forzar CAST explícito usando SQL directo ---
    const { error: sqlError } = await supabase
      .from('checkout_sessions')
      .update({
        email_final: email,
        updated_at: new Date().toISOString(),
      })
      .filter('id::uuid', 'eq', session_id); // 👈 aquí hacemos el cast correcto

    if (sqlError) {
      console.error('[confirm-purchase v5.7] Error al actualizar checkout_sessions:', sqlError.message);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error al actualizar checkout_sessions: ${sqlError.message}`,
        }),
        { status: 400, headers: { 'Access-Control-Allow-Origin': origin } }
      );
    }

    console.log('[confirm-purchase v5.7] checkout_sessions actualizado correctamente.');

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
        '[confirm-purchase v5.7] Error al insertar en outbox_emails:',
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

    console.log('[confirm-purchase v5.7] Email agregado exitosamente a outbox_emails.');

    // --- Respuesta OK ---
    return new Response(
      JSON.stringify({
        success: true,
        message: `[confirm-purchase v5.7] OK para session_id: ${session_id}`,
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
    console.error('[confirm-purchase v5.7] ERROR FATAL:', err.message);
    return new Response(
      JSON.stringify({
        success: false,
        message: `[confirm-purchase v5.7] ERROR: ${err.message}`,
      }),
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
