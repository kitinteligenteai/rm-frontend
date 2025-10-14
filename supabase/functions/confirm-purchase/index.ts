// supabase/functions/confirm-purchase/index.ts
// Versión 5.4 — Fix final: CORS completo + UUID cast + logs claros

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log('[confirm-purchase v5.4] Function initialized');

Deno.serve(async (req) => {
  try {
    const origin = req.headers.get('origin') || '*';

    // --- Manejo CORS (preflight) ---
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          // ✅ Incluimos todos los headers que usa supabase-js
          'Access-Control-Allow-Headers':
            'Content-Type, Authorization, apikey, Prefer',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // --- Leer cuerpo ---
    const { session_id, email } = await req.json();
    console.log('[confirm-purchase v5.4] Payload recibido:', { session_id, email });

    if (!session_id || !email) {
      console.error('[confirm-purchase v5.4] Faltan datos requeridos');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Faltan datos requeridos (session_id o email)',
        }),
        { status: 400, headers: { 'Access-Control-Allow-Origin': origin } }
      );
    }

    // --- Crear cliente Supabase ---
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- 1️⃣ Actualizar checkout_sessions (fix UUID cast) ---
    console.log('[confirm-purchase v5.4] Intentando actualizar checkout_sessions...');

    const { error: updateError } = await supabase
      .from('checkout_sessions')
      .update({
        email_final: email,
        updated_at: new Date().toISOString(),
      })
      .filter('id', 'eq', session_id); // ya no lanza error de tipo

    if (updateError) {
      console.error(
        '[confirm-purchase v5.4] Error al actualizar checkout_sessions:',
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

    console.log('[confirm-purchase v5.4] checkout_sessions actualizado correctamente.');

    // --- 2️⃣ Insertar correo en outbox_emails ---
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
        '[confirm-purchase v5.4] Error al insertar en outbox_emails:',
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

    console.log('[confirm-purchase v5.4] Email agregado exitosamente a outbox_emails.');

    // --- 3️⃣ Respuesta OK ---
    return new Response(
      JSON.stringify({
        success: true,
        message: `[confirm-purchase v5.4] OK para session_id: ${session_id}`,
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
    console.error('[confirm-purchase v5.4] ERROR FATAL:', err.message);
    return new Response(
      JSON.stringify({
        success: false,
        message: `[confirm-purchase v5.4] ERROR: ${err.message}`,
      }),
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
