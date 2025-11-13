// supabase/functions/email-worker-v2/index.ts
// BUILD: 2025-10-15 — v7.2-STABLE-NOTIFY-FIX
// Propósito: enviar correos de bienvenida y notificaciones NTFY de manera idempotente.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3.2.0';

const BUILD = 'email-worker-v2@2025-10-15-v7.2-STABLE-NOTIFY-FIX';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// --- Plantilla de correo ACTUALIZADA DEL KIT ---
const welcomeEmailTemplate = {
  subject: 'Tu acceso al Kit de 7 días – Reinicio Metabólico',
  html: `<!DOCTYPE html><html lang="es"><body style="font-family:Arial,sans-serif;line-height:1.5;color:#333;">
    <h2>¡Bienvenido a Reinicio Metabólico!</h2>
    <p>Gracias por tu compra. Aquí tienes tu acceso al Kit de 7 días.</p>

    <p>
      <a href="https://mgjzlohapnepvrqlxmpo.supabase.co/storage/v1/object/public/productos-digitales/Tu_Plan_de_7_Dias_Reinicio_Metabolico.pdf"
        style="background:#28a745;color:#fff;padding:10px 15px;text-decoration:none;border-radius:4px;">
        Acceder al Kit
      </a>
    </p>

    <p>Si tienes dudas, contáctanos en 
       <a href="mailto:soporte@reiniciometabolico.net">soporte@reiniciometabolico.net</a>.
    </p>

    <p>Saludos,<br>El equipo de Reinicio Metabólico</p>
  </body></html>`,

  text: `¡Bienvenido a Reinicio Metabólico!

Gracias por tu compra. Aquí tienes tu acceso al Kit de 7 días:
https://mgjzlohapnepvrqlxmpo.supabase.co/storage/v1/object/public/productos-digitales/Tu_Plan_de_7_Dias_Reinicio_Metabolico.pdf

Dudas: soporte@reiniciometabolico.net

Saludos,
El equipo de Reinicio Metabólico`
};


// --- WORKER PRINCIPAL ---
Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) throw new Error('Falta RESEND_API_KEY en Secrets.');

    const resend = new Resend(resendApiKey);
    const topic = Deno.env.get('NTFY_TOPIC') || 'reiniciometabolico';

    // --- Buscar correos pendientes ---
    const { data: queuedEmails, error: qErr } = await supabase
      .from('outbox_emails')
      .select('id, to_email, template, payload, attempts, status')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(10);

    if (qErr) throw qErr;

    if (!queuedEmails?.length) {
      console.log(`[${BUILD}] No hay correos pendientes.`);
      return new Response(
        JSON.stringify({ message: 'Sin correos por enviar.' }),
        { headers: corsHeaders, status: 200 }
      );
    }

    console.log(`[${BUILD}] Se encontraron ${queuedEmails.length} correos en cola.`);

    for (const job of queuedEmails) {
      try {
        let to = (job.to_email || '').trim().toLowerCase();
        const isTestUser = to.endsWith('@testuser.com');

        // 🚫 Idempotencia: evitar duplicados
        if (job.status === 'sent') {
          console.log(`[${BUILD}] Job ${job.id}: ya enviado, se omite.`);
          continue;
        }

        // 1️⃣ Resolver email si falta
        if (!to || isTestUser) {
          console.log(`[${BUILD}] Job ${job.id}: resolviendo email...`);

          const payload = job.payload || {};
          let resolvedEmail = null;

          if (payload.session_id) {
            const { data: session } = await supabase
              .from('checkout_sessions')
              .select('email_final')
              .eq('id', payload.session_id)
              .single();

            resolvedEmail = session?.email_final?.trim().toLowerCase() || null;
          }

          if (resolvedEmail && !resolvedEmail.endsWith('@testuser.com')) {
            await supabase
              .from('outbox_emails')
              .update({ to_email: resolvedEmail })
              .eq('id', job.id);

            to = resolvedEmail;
          } else {
            await supabase
              .from('outbox_emails')
              .update({
                status: 'queued',
                attempts: (job.attempts || 0) + 1,
                last_error: 'esperando email_final válido',
                updated_at: new Date().toISOString()
              })
              .eq('id', job.id);

            continue;
          }
        }

        // 2️⃣ Enviar correo
        console.log(`[${BUILD}] Enviando correo a ${to} ...`);

        const { data: sent, error: sendErr } = await resend.emails.send({
          from: 'Reinicio Metabólico <acceso@reiniciometabolico.net>',
          to,
          subject: welcomeEmailTemplate.subject,
          html: welcomeEmailTemplate.html,
          text: welcomeEmailTemplate.text,
          reply_to: 'soporte@reiniciometabolico.net'
        });

        if (sendErr) throw sendErr;

        // 3️⃣ Actualizar estado
        await supabase
          .from('outbox_emails')
          .update({
            status: 'sent',
            provider_message_id: sent?.id ?? null,
            last_error: null,
            attempts: (job.attempts || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);

        // 4️⃣ NTFY de confirmación
        try {
          await fetch(`https://ntfy.sh/${topic}`, {
            method: 'POST',
            body: `✅ Correo enviado correctamente a ${to}`,
            headers: {
              Title: 'Correo enviado – Reinicio Metabólico',
              Tags: 'mailbox,white_check_mark'
            }
          });
        } catch (_) {}

      } catch (err) {
        console.error(`[${BUILD}] Error en job ${job.id}:`, err.message);

        const attempts = (job.attempts || 0) + 1;

        await supabase.from('outbox_emails').update({
          status: attempts >= 5 ? 'failed' : 'queued',
          attempts,
          last_error: err?.message ?? String(err),
          updated_at: new Date().toISOString()
        }).eq('id', job.id);
      }
    }

    return new Response(
      JSON.stringify({ message: `Procesados ${queuedEmails.length} correos.` }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (e) {
    console.error(`[${BUILD}] FATAL:`, e?.message || e);

    return new Response(
      JSON.stringify({ error: e?.message || String(e) }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
