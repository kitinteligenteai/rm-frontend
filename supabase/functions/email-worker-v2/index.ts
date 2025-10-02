// email-worker-v2 — BUILD: 2025-10-02-LAZY-RESOLUTION
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3.2.0';

const BUILD = 'email-worker-v2@2025-10-02-LAZY-RESOLUTION';

// --- Plantilla de correo (sin cambios ) ---
const welcomeEmailTemplate = {
  subject: 'Tu acceso al Kit de 7 días – Reinicio Metabólico',
  html: `<!DOCTYPE html><html lang="es"><body style="font-family:Arial,sans-serif;line-height:1.5;color:#333;">
    <h2>¡Bienvenido a Reinicio Metabólico!</h2>
    <p>Gracias por tu compra. Aquí tienes tu acceso al Kit de 7 días.</p>
    <p><a href="https://reiniciometabolico.net/kits/kit-7-dias.pdf"
      style="background:#28a745;color:#fff;padding:10px 15px;text-decoration:none;border-radius:4px;">Acceder al Kit</a></p>
    <p>Si tienes dudas, contáctanos en <a href="mailto:soporte@reiniciometabolico.net">soporte@reiniciometabolico.net</a>.</p>
    <p>Saludos,  
El equipo de Reinicio Metabólico</p>
  </body></html>`,
  text: `¡Bienvenido a Reinicio Metabólico!\n\nGracias por tu compra. Aquí tienes tu acceso al Kit de 7 días:\nhttps://reiniciometabolico.net/kits/kit-7-dias.pdf\n\nDudas: soporte@reiniciometabolico.net\n\nSaludos,\nEl equipo de Reinicio Metabólico`,
};

Deno.serve(async ( ) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) throw new Error('RESEND_API_KEY secret is missing.');
    const resend = new Resend(resendApiKey);

    // --- Obtener correos en cola (sin cambios) ---
    const { data: queuedEmails, error: qErr } = await supabase
      .from('outbox_emails')
      .select('id, to_email, template, payload, attempts')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(10);

    if (qErr) throw qErr;

    if (!queuedEmails?.length) {
      console.log(`[${BUILD}] No emails to process.`);
      return new Response(JSON.stringify({ message: 'No emails to send.' }), { status: 200 });
    }

    console.log(`[${BUILD}] Found ${queuedEmails.length} emails to process.`);

    // --- INICIO DE LA NUEVA LÓGICA DE PROCESAMIENTO ---
    for (const emailRecord of queuedEmails) {
      try {
        let to = (emailRecord.to_email || '').trim().toLowerCase();
        const isTestUser = to.endsWith('@testuser.com');

        // 1. LÓGICA DE RESOLUCIÓN PEREZOSA: Si no hay destinatario o es de prueba, intentar resolverlo.
        if (!to || isTestUser) {
          console.log(`[${BUILD}] Job ${emailRecord.id}: Recipient is missing or is a test user. Attempting to resolve...`);
          const payload = emailRecord.payload || {};
          let resolvedEmail: string | null = null;

          // Función auxiliar para buscar el email en checkout_sessions
          const tryResolveFromSession = async (sid: string) => {
            if (!sid) return null;
            const { data: session } = await supabase
              .from('checkout_sessions')
              .select('email_final')
              .eq('id', sid)
              .single();
            return session?.email_final?.trim().toLowerCase() || null;
          };

          // Intentar resolver usando el session_id del payload
          if (payload.session_id) {
            resolvedEmail = await tryResolveFromSession(payload.session_id);
          }

          // Si se encontró un email válido, actualizar el registro y continuar
          if (resolvedEmail && !resolvedEmail.endsWith('@testuser.com')) {
            console.log(`[${BUILD}] Job ${emailRecord.id}: Success! Resolved recipient to ${resolvedEmail}.`);
            await supabase
              .from('outbox_emails')
              .update({ to_email: resolvedEmail })
              .eq('id', emailRecord.id);
            to = resolvedEmail; // Actualizamos la variable 'to' para el envío inmediato
          } else {
            // Si no se encontró, marcar para reintentar y saltar al siguiente correo
            console.log(`[${BUILD}] Job ${emailRecord.id}: Could not resolve recipient yet. Will retry in the next cycle.`);
            await supabase.from('outbox_emails').update({
              status: 'queued', // Mantener en cola
              attempts: (emailRecord.attempts || 0) + 1,
              last_error: 'waiting_for_email_final',
              updated_at: new Date().toISOString(),
            }).eq('id', emailRecord.id);
            continue; // ¡IMPORTANTE! Salta al siguiente correo del bucle
          }
        }

        // 2. LÓGICA DE ENVÍO: Solo se ejecuta si 'to' es un destinatario válido.
        console.log(`[${BUILD}] Job ${emailRecord.id}: Sending email to ${to}`);
        const { data: sentEmail, error: sendError } = await resend.emails.send({
          from: 'Reinicio Metabólico <acceso@reiniciometabolico.net>',
          to: to,
          subject: welcomeEmailTemplate.subject,
          html: welcomeEmailTemplate.html,
          text: welcomeEmailTemplate.text,
          reply_to: 'soporte@reiniciometabolico.net',
        });

        if (sendError) {
          throw sendError; // El bloque catch se encargará de manejar el error
        }

        // 3. ACTUALIZAR A 'SENT': Si el envío fue exitoso.
        await supabase.from('outbox_emails').update({
          status: 'sent',
          provider_message_id: sentEmail.id,
          last_error: null,
          attempts: (emailRecord.attempts || 0) + 1,
          updated_at: new Date().toISOString(),
        }).eq('id', emailRecord.id);

        console.log(`[${BUILD}] Job ${emailRecord.id}: Successfully sent. Resend ID: ${sentEmail.id}`);

      } catch (sendErr) {
        // 4. MANEJO DE ERRORES: Si algo falla durante la resolución o el envío.
        console.error(`[${BUILD}] Job ${emailRecord.id}: Failed. Error:`, sendErr.message);
        const attempts = (emailRecord.attempts || 0) + 1;
        await supabase.from('outbox_emails').update({
          status: attempts >= 5 ? 'failed' : 'queued', // Reintentar hasta 5 veces
          attempts,
          last_error: sendErr?.message ?? String(sendErr),
          updated_at: new Date().toISOString(),
        }).eq('id', emailRecord.id);
      }
    }
    // --- FIN DE LA NUEVA LÓGICA ---

    return new Response(JSON.stringify({ message: `Processed ${queuedEmails.length} emails.` }), { status: 200 });

  } catch (e) {
    console.error(`[${BUILD}] Fatal error in email-worker:`, e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500 });
  }
});
