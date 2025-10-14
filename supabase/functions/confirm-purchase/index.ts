// supabase/functions/confirm-purchase/index.ts
// Versión 6.0 — Fix total: cast UUID con SQL directo + CORS + logs limpios

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log('[confirm-purchase v6.0] Function initialized');

Deno.serve(async (req) => {
  try {
    const origin = req.headers.get('origin') || '*';

    // --- Manejo CORS ---
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, Prefer',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // --- Leer body ---
    const { session_id, email } = await req.json();
    console.log('[confirm-purchase v6.0] Payload recibido:', { session_id, email });

    if (!session_id || !email) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Faltan datos requeridos (session_id o email)',
        }),
        { status: 400, headers: { 'Access-Control-Allow-Origin': origin } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Ejecutar UPDATE usando SQL directo ---
    console.log('[confirm-purchase v6.0] Intentando actualizar con SQL directo...');
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      sql_text: `
        UPDATE checkout_sessions
        SET email_final = '${email}', updated_at = now()
        WHERE id = '${session_id}'::uuid;
      `,
    });

    if (sqlError) {
      console.error('[confirm-purchase v6.0] Error SQL:', sqlError.message);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error SQL al actualizar checkout_sessions: ${sqlError.message}`,
        }),
        { status: 400, headers: { 'Access-Control-Allow-Origin': origin } }
      );
    }

    console.log('[confirm-purchase v6.0] checkout_sessions actualizado correctamente.');

    // --- Insertar en outbox_emails ---
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
      console.error('[confirm-purchase v6.0] Error al insertar en outbox_emails:', insertError.message);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error al insertar en outbox_emails: ${insertError.message}`,
        }),
        { status: 400, headers: { 'Access-Control-Allow-Origin': origin } }
      );
    }

    console.log('[confirm-purchase v6.0] Email agregado a outbox_emails.');

    return new Response(
      JSON.stringify({
        success: true,
        message: `[confirm-purchase v6.0] OK para session_id: ${session_id}`,
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
    console.error('[confirm-purchase v6.0] ERROR FATAL:', err.message);
    return new Response(
      JSON.stringify({
        success: false,
        message: `[confirm-purchase v6.0] ERROR: ${err.message}`,
      }),
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
