// email-worker-v2 — BUILD: 2025-09-25-RX-ENHANCED
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3.2.0';
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
  text: `¡Bienvenido a Reinicio Metabólico!\n\n` + `Gracias por tu compra. Aquí tienes tu acceso al Kit de 7 días:\n` + `https://reiniciometabolico.net/kits/kit-7-dias.pdf\n\n` + `Dudas: soporte@reiniciometabolico.net\n\nSaludos,\nEl equipo de Reinicio Metabólico`
};
Deno.serve(async ()=>{
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) throw new Error('Falta RESEND_API_KEY (Secret no accesible).');
    const resend = new Resend(resendApiKey);
    const { data: queued, error: qErr } = await supabase.from('outbox_emails').select('id,to_email,template,payload,attempts').eq('status', 'queued').order('created_at', {
      ascending: true
    }).limit(10);
    if (qErr) throw qErr;
    if (!queued?.length) {
      return new Response(JSON.stringify({
        message: 'No hay correos para enviar.'
      }), {
        status: 200
      });
    }
    for (const row of queued){
      const { data: claimed, error: claimErr } = await supabase.from('outbox_emails').update({
        status: 'sending',
        attempts: (row.attempts ?? 0) + 1,
        updated_at: new Date().toISOString()
      }).eq('id', row.id).eq('status', 'queued').select('id').single();
      if (claimErr || !claimed) {
        continue;
      }
      try {
        if (!row.to_email) {
          throw new Error('to_email vacío o inválido');
        }
        const { data, error } = await resend.emails.send({
          from: 'Reinicio Metabólico <acceso@reiniciometabolico.net>',
          to: row.to_email,
          subject: welcomeEmailTemplate.subject,
          html: welcomeEmailTemplate.html,
          text: welcomeEmailTemplate.text,
          reply_to: 'soporte@reiniciometabolico.net',
          headers: {
            'List-Unsubscribe': '<mailto:baja@reiniciometabolico.net>'
          }
        });
        if (error) {
          throw new Error(typeof error === 'string' ? error : error.message ?? JSON.stringify(error));
        }
        // LÍNEA MEJORADA: Captura el ID de forma más robusta.
        const providerId = data?.id || null;
        await supabase.from('outbox_emails').update({
          status: 'sent',
          provider_message_id: providerId,
          last_error: null,
          updated_at: new Date().toISOString()
        }).eq('id', row.id);
      } catch (sendErr) {
        const attempts = (row.attempts ?? 0) + 1;
        await supabase.from('outbox_emails').update({
          status: attempts >= 3 ? 'failed' : 'queued',
          attempts,
          last_error: sendErr?.message ?? String(sendErr),
          updated_at: new Date().toISOString()
        }).eq('id', row.id);
      }
    }
    return new Response(JSON.stringify({
      message: `Procesados ${queued.length} correos.`
    }), {
      status: 200
    });
  } catch (e) {
    console.error('Error fatal email-worker-v2:', e?.message || e);
    return new Response(JSON.stringify({
      error: e?.message || String(e)
    }), {
      status: 500
    });
  }
});
