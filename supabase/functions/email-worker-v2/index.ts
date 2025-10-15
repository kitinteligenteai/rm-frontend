// email-worker-v2 — BUILD: 2025-10-15-STABLE-NOTIFY-FIX
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3.2.0';

const BUILD = 'email-worker-v2@2025-10-15-STABLE-NOTIFY-FIX';

// --- Plantilla de correo (sin cambios) ---
const welcomeEmailTemplate = {
  subject: 'Tu acceso al Kit de 7 días – Reinicio Metabólico',
  html: `<!DOCTYPE html><html lang="es"><body style="font-family:Arial,sans-serif;line-height:1.5;color:#333;">
    <h2>¡Bienvenido a Reinicio Metabólico!</h2>
    <p>Gracias por tu compra. Aquí tienes tu acceso al Kit de 7 días.</p>
    <p><a href="https://reiniciometabolico.net/kits/kit-7-dias.pdf"
      style="background:#28a745;color:#fff;padding:10px 15px;text-decoration:none;border-radius:4px;">Acceder al Kit</a></p>
    <p>Si tienes dudas, contáctanos en <a href="mailto:soporte@reiniciometabolico.net">soporte@reiniciometabolico.net</a>.</p>
    <p>Saludos,<br>El equipo de Reinicio Metabólico</p>
  </body></html>`,
  text: `¡Bienvenido a Reinicio Metabólico!\n\nGracias por tu compra. Aquí tienes tu acceso al Kit de 7 días:\nhttps://reiniciometabolico.net/kits/kit-7-dias.pdf\n\nDudas: soporte@reiniciometabolico.net\n\nSaludos,\nEl equipo de Reinicio Metabólico`
};

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) throw new Error('RESEND_API_KEY secret is missing.');
    const resend = new Resend(resendApiKey);

    // --- Obtener correos en cola ---
    const { data: queuedEmails, error: qErr } = await supabase
      .from('outbox_emails')
      .select('id, to_email, template, payload, attempts, status')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(10);

    if (qErr) throw qErr;
    if (!queuedEmails?.length) {
      console.log(`[${BUILD}] No emails to process.`);
      return new Response(JSON.stringify({ message: 'No emails to send.' }), { status: 200 });
    }

    console.log(`[${BUILD}] Found ${queuedEmails.length} emails to process.`);

    for (const emailRecord of queuedEmails) {
      try {
        let to = (emailRecord.to_email || '').trim().toLowerCase();
        const isTestUser = to.endsWith('@testuser.com');

        // 🚫 Protección: evitar reprocesar correos ya enviados
        if (emailRecord.status === 'sent') {
          console.log(`[${BUILD}] Job ${emailRecord.id}: already sent, skipping duplicate push.`);
          continue;
        }

        // 1️⃣ Resolución perezosa
        if (!to || isTestUser) {
          console.log(`[${BUILD}] Job ${emailRecord.id}: Recipient is missing or test user, resolving...`);
          const payload = emailRecord.payload || {};
          let resolvedEmail = null;

          const tryResolveFromSession = async (sid) => {
            if (!sid) return null;
            const { data: session } = await supabase
              .from('checkout_sessions')
              .select('email_final')
              .eq('id', sid)
              .single();
            return session?.email_final?.trim().toLowerCase() || null;
          };

          if (payload.session_id) resolvedEmail = await tryResolveFromSession(payload.session_id);

          if (resolvedEmail && !resolvedEmail.endsWith('@testuser.com')) {
            console.log(`[${BUILD}] Job ${emailRecord.id}: Resolved recipient → ${resolvedEmail}`);
            await supabase.from('outbox_emails').update({ to_email: resolvedEmail }).eq('id', emailRecord.id);
            to = resolvedEmail;
          } else {
            await supabase.from('outbox_emails').update({
              status: 'queued',
              attempts: (emailRecord.attempts || 0) + 1,
              last_error: 'waiting_for_email_final',
              updated_at: new Date().toISOString()
            }).eq('id', emailRecord.id);
            continue;
          }
        }

        // 2️⃣ Envío del correo
        console.log(`[${BUILD}] Job ${emailRecord.id}: Sending email to ${to}`);
        const { data: sentEmail, error: sendError } = await resend.emails.send({
          from: 'Reinicio Metabólico <acceso@reiniciometabolico.net>',
          to,
          subject: welcomeEmailTemplate.subject,
          html: welcomeEmailTemplate.html,
          text: welcomeEmailTemplate.text,
          reply_to: 'soporte@reiniciometabolico.net'
        });

        if (sendError) throw sendError;

        // 3️⃣ Actualizar a 'sent'
        await supabase.from('outbox_emails').update({
          status: 'sent',
          provider_message_id: sentEmail.id,
          last_error: null,
          attempts: (emailRecord.attempts || 0) + 1,
          updated_at: new Date().toISOString()
        }).eq('id', emailRecord.id);

        console.log(`[${BUILD}] Job ${emailRecord.id}: Successfully sent. Resend ID: ${sentEmail.id}`);

        // 4️⃣ Notificación NTFY (una sola vez)
        try {
          await fetch('https://ntfy.sh/reiniciometabolico', {
            method: 'POST',
            body: `✅ Correo enviado correctamente a ${to}`
          });
        } catch (err) {
          console.error(`[${BUILD}] Error enviando NTFY:`, err.message);
        }

      } catch (sendErr) {
        console.error(`[${BUILD}] Job ${emailRecord.id}: Failed. Error:`, sendErr.message);
        const attempts = (emailRecord.attempts || 0) + 1;
        await supabase.from('outbox_emails').update({
          status: attempts >= 5 ? 'failed' : 'queued',
          attempts,
          last_error: sendErr?.message ?? String(sendErr),
          updated_at: new Date().toISOString()
        }).eq('id', emailRecord.id);
      }
    }

    return new Response(JSON.stringify({ message: `Processed ${queuedEmails.length} emails.` }), { status: 200 });

  } catch (e) {
    console.error(`[${BUILD}] Fatal error in email-worker:`, e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500 });
  }
});
