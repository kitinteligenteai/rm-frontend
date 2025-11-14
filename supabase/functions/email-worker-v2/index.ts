// supabase/functions/email-worker-v2/index.ts
// BUILD: 2025-11-13 — v7.3-STABLE-KIT-PDF-FIX
// Propósito: enviar correos del Kit y evitar duplicados.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3.2.0';

const BUILD = 'email-worker-v2@2025-11-13-v7.3-STABLE-KIT-PDF-FIX';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// -------------------------------------------------------
// PLANTILLA ACTUALIZADA CON EL PDF CORRECTO
// -------------------------------------------------------
const welcomeEmailTemplate = {
  subject: 'Tu acceso al Kit de 7 días – Reinicio Metabólico',
  html: `<!DOCTYPE html><html lang="es"><body style="font-family:Arial,sans-serif;line-height:1.5;color:#333;">
    <h2>¡Bienvenido a Reinicio Metabólico!</h2>
    <p>Gracias por tu compra. Aquí tienes tu acceso completo al <strong>Kit de 7 días</strong>.</p>

    <p>
      <a href="https://mgjzlohapnepvrqlxmpo.supabase.co/storage/v1/object/public/productos-digitales/Tu_Plan_de_7_Dias_Reinicio_Metabolico.pdf"
         style="background:#28a745;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;font-size:16px;">
         📥 Descargar Kit de 7 días
      </a>
    </p>

    <p>Si tienes dudas, contáctanos en 
       <a href="mailto:soporte@reiniciometabolico.net">soporte@reiniciometabolico.net</a>.
    </p>

    <p>Saludos,<br>El equipo de Reinicio Metabólico</p>
  </body></html>`,

  text: `Tu Kit de 7 días de Reinicio Metabólico está listo.

Descárgalo aquí:
https://mgjzlohapnepvrqlxmpo.supabase.co/storage/v1/object/public/productos-digitales/Tu_Plan_de_7_Dias_Reinicio_Metabolico.pdf

Dudas: soporte@reiniciometabolico.net

Saludos,
El equipo de Reinicio Metabólico`
};


// -------------------------------------------------------
// WORKER PRINCIPAL
// -------------------------------------------------------
Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) throw new Error('Falta RESEND_API_KEY');

    const resend = new Resend(resendApiKey);
    const topic = Deno.env.get('NTFY_TOPIC') || 'reiniciometabolico';

    // Obtener correos pendientes
    const { data: queuedEmails, error: qErr } = await supabase
      .from('outbox_emails')
      .select('id, to_email, template, payload, attempts, status')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(10);

    if (qErr) throw qErr;
    if (!queuedEmails?.length) {
      console.log(`[${BUILD}] No hay correos pendientes.`);
      return new Response(JSON.stringify({ message: 'Sin correos por enviar.' }), {
        headers: corsHeaders,
        status: 200
      });
    }

    console.log(`[${BUILD}] Procesando ${queuedEmails.length} correos...`);

    for (const job of queuedEmails) {
      try {
        let to = (job.to_email || '').trim().toLowerCase();
        const isTest = to.endsWith('@testuser.com');

        // Idempotencia
        if (job.status === 'sent') continue;

        // Resolver email si falta
        if (!to || isTest) {
          const payload = job.payload || {};
          let resolvedEmail = null;

          if (payload.session_id) {
            const { data: s } = await supabase
              .from('checkout_sessions')
              .select('email_final')
              .eq('id', payload.session_id)
              .single();

            resolvedEmail = s?.email_final?.trim().toLowerCase() || null;
          }

          if (resolvedEmail && !resolvedEmail.endsWith('@testuser.com')) {
            await supabase.from('outbox_emails')
              .update({ to_email: resolvedEmail })
              .eq('id', job.id);

            to = resolvedEmail;
          } else {
            await supabase.from('outbox_emails').update({
              status: 'queued',
              attempts: (job.attempts || 0) + 1,
              last_error: 'esperando email_final válido',
              updated_at: new Date().toISOString()
            }).eq('id', job.id);

            continue;
          }
        }

        // -------------------------------------------------------
        // ENVÍO DEL CORREO (Con plantilla actualizada)
        // -------------------------------------------------------
        const { data: sentEmail, error: sendErr } = await resend.emails.send({
          from: 'Reinicio Metabólico <acceso@reiniciometabolico.net>',
          to,
          subject: welcomeEmailTemplate.subject,
          html: welcomeEmailTemplate.html,
          text: welcomeEmailTemplate.text
        });

        if (sendErr) throw sendErr;

        // Actualizar estado
        await supabase.from('outbox_emails').update({
          status: 'sent',
          provider_message_id: sentEmail?.id ?? null,
          last_error: null,
          attempts: (job.attempts || 0) + 1,
          updated_at: new Date().toISOString()
        }).eq('id', job.id);

        // Notificación NTFY
        await fetch(`https://ntfy.sh/${topic}`, {
          method: 'POST',
          body: `📩 Correo enviado a ${to}`,
          headers: { Title: 'Correo enviado', Tags: 'email' }
        });

      } catch (err) {
        const attempts = (job.attempts || 0) + 1;

        await supabase.from('outbox_emails').update({
          status: attempts >= 5 ? 'failed' : 'queued',
          attempts,
          last_error: err?.message ?? String(err),
          updated_at: new Date().toISOString()
        }).eq('id', job.id);
      }
    }

    return new Response(JSON.stringify({ message: 'ok' }), {
      headers: corsHeaders,
      status: 200
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: corsHeaders,
      status: 500
    });
  }
});
