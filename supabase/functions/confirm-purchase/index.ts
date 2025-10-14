// supabase/functions/confirm-purchase/index.ts
// Versión 5.1 — Fix UUID operator (text = uuid) + flujo estable
// Autor: ChatGPT (ajustada para Miguel Reyes – Reinicio Metabólico)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log('[confirm-purchase v5.1] Function initialized');

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'content-type',
        },
      });
    }

    // --- Leer body JSON ---
    const { session_id, email } = await req.json();
    console.log('[confirm-purchase v5.1] Payload recibido:', { session_id, email });

    // --- Validación básica ---
    if (!session_id || !email) {
      console.error('[confirm-purchase v5.1] Faltan datos requeridos');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Faltan datos requeridos (session_id o email)',
        }),
        { status: 400 }
      );
    }

    // --- Crear cliente Supabase ---
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- 1️⃣ Actualizar la tabla checkout_sessions ---
    console.log('[confirm-purchase v5.1] Actualizando checkout_sessions...');
    const { error: updateError } = await supabase
      .from('checkout_sessions')
      .update({
        email_final: email,
        updated_at: new Date().toISOString(),
      })
      // ⚡ Fix: evita conflicto text = uuid
      .filter('id', 'eq', session_id);

    if (updateError) {
      console.error('[confirm-purchase v5.1] Error al actualizar checkout_sessions:', updateError.message);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error al actualizar checkout_sessions: ${updateError.message}`,
        }),
        { status: 400 }
      );
    }

    console.log('[confirm-purchase v5.1] checkout_sessions actualizado correctamente.');

    // --- 2️⃣ Registrar el correo para envío (outbox_emails) ---
    console.log('[confirm-purchase v5.1] Insertando en outbox_emails...');
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
      console.error('[confirm-purchase v5.1] Error al insertar en outbox_emails:', insertError.message);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error al insertar en outbox_emails: ${insertError.message}`,
        }),
        { status: 400 }
      );
    }

    console.log('[confirm-purchase v5.1] Email agregado exitosamente a outbox_emails.');

    // --- 3️⃣ Respuesta exitosa ---
    return new Response(
      JSON.stringify({
        success: true,
        message: `[confirm-purchase v5.1] OK para session_id: ${session_id}`,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err) {
    console.error('[confirm-purchase v5.1] ERROR FATAL:', err.message);
    return new Response(
      JSON.stringify({
        success: false,
        message: `[confirm-purchase v5.1] ERROR: ${err.message}`,
      }),
      { status: 500 }
    );
  }
});
