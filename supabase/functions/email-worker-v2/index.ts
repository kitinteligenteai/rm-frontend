// supabase/functions/email-worker-v2/index.ts
// BUILD: 2025-11-13 — v8.0-UNIVERSAL-TEMPLATE-ENGINE
// Email Worker con motor de plantillas escalable (C), Kit + Programa + Futuro

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3.2.0';

const BUILD = 'email-worker-v2@2025-11-13-v8.0-TEMPLATE-ENGINE';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// =======================================================
//  PLANTILLAS — SISTEMA COMPLETO Y ESCALABLE (Opción C)
// =======================================================

// 1) KIT DE 7 DÍAS --------------------------------------
const templateWelcomeKit = {
  subject: 'Tu acceso al Kit de 7 días – Reinicio Metabólico',
  html: `<!DOCTYPE html><html><body style="font-family:Arial;color:#333;line-height:1.5;">
    <h2>¡Bienvenido a Reinicio Metabólico!</h2>
    <p>Tu <strong>Kit de 7 días</strong> está listo.</p>

    <p>
      <a href="https://mgjzlohapnepvrqlxmpo.supabase.co/storage/v1/object/public/productos-digitales/Tu_Plan_de_7_Dias_Reinicio_Metabolico.pdf"
         style="background:#28a745;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;">
         📥 Descargar Kit
      </a>
    </p>

    <p>Soporte: <a href="mailto:soporte@reiniciometabolico.net">soporte@reiniciometabolico.net</a></p>
    <p>Saludos,<br>Equipo Reinicio Metabólico</p>
  </body></html>`,
  text: `Tu Kit de 7 días está listo.

Descárgalo aquí:
https://mgjzlohapnepvrqlxmpo.supabase.co/storage/v1/object/public/productos-digitales/Tu_Plan_de_7_Dias_Reinicio_Metabolico.pdf

Saludos,
Equipo Reinicio Metabólico`
};


// 2) PROGRAMA COMPLETO (UPSELL $75 USD) ------------------
const templateWelcomeProgram = {
  subject: 'Acceso al Programa Completo – Reinicio Metabólico',
  html: `<!DOCTYPE html><html><body style="font-family:Arial;color:#333;line-height:1.5;">
    <h2>¡Bienvenido al Programa Completo!</h2>
    <p>Tu acceso al programa anual está listo. Crea tu contraseña aquí:</p>

    <p>
      <a href="https://reiniciometabolico.net/auth"
         style="background:#0066cc;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;">
         🔐 Crear contraseña y acceder
      </a>
    </p>

    <p>Usa el mismo correo con el que realizaste tu compra.</p>
    <p>Soporte: soporte@reiniciometabolico.net</p>
    <p>¡Vamos con todo!<br>Equipo Reinicio Metabólico</p>
  </body></html>`,
  text: `Tu acceso al Programa Completo está listo.

Crea tu contraseña aquí:
https://reiniciometabolico.net/auth

Usa tu correo de compra.

Equipo Reinicio Metabólico`
};


// 3) Futuras plantillas ---------------------------------
const templates = {
  "welcome-kit": templateWelcomeKit,
  "welcome-program": templateWelcomeProgram
  // aquí podrás agregar más en el futuro:
  // "reset-password": templateResetPassword,
  // "daily-tip": templateDailyTip
};


// =======================================================
//   WORKER — PROCESA LOS CORREOS EN outbox_emails
// =======================================================
Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) throw new Error('Falta RESEND_API_KEY en secrets.');

    const resend = new Resend(resendApiKey);
    const topic = Deno.env.get('NTFY_TOPIC') || 'reiniciometabolico';

    // Leer trabajos pendientes
    const { data: jobs, error: qErr } = await supabase
      .from('outbox_emails')
      .select('id, to_email, template, payload, attempts, status')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(10);

    if (qErr) throw qErr;
    if (!jobs?.length) {
      console.log(`[${BUILD}] Sin correos por enviar.`);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    console.log(`[${BUILD}] Procesando ${jobs.length} correos.`);

    for (const job of jobs) {
      try {
        let to = (job.to_email || '').trim().toLowerCase();

        // Saltar duplicados
        if (job.status === 'sent') continue;

        // Resolver email si falta
        if (!to || to.endsWith('@testuser.com')) {
          const sid = job.payload?.session_id;
          if (sid) {
            const { data: s } = await supabase
              .from('checkout_sessions')
              .select('email_final')
              .eq('id', sid)
              .single();

            if (s?.email_final) {
              to = s.email_final.toLowerCase();
              await supabase.from('outbox_emails')
                .update({ to_email: to })
                .eq('id', job.id);
            } else {
              // esperar al siguiente ciclo
              await supabase.from('outbox_emails').update({
                attempts: (job.attempts || 0) + 1,
                last_error: "email_final no disponible"
              }).eq('id', job.id);
              continue;
            }
          }
        }

        // Seleccionar plantilla correcta
        const tpl = templates[job.template];

        if (!tpl) {
          console.error(`[${BUILD}] ❌ Plantilla desconocida: ${job.template}`);
          await supabase.from('outbox_emails').update({
            status: 'failed',
            last_error: `Plantilla desconocida: ${job.template}`
          }).eq('id', job.id);
          continue;
        }

        console.log(`[${BUILD}] Enviando ${job.template} → ${to}`);

        // Enviar correo
        const { data: sent, error: sendErr } = await resend.emails.send({
          from: 'Reinicio Metabólico <acceso@reiniciometabolico.net>',
          to,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
          reply_to: 'soporte@reiniciometabolico.net'
        });

        if (sendErr) throw sendErr;

        // Marcar como enviado
        await supabase.from('outbox_emails').update({
          status: 'sent',
          provider_message_id: sent?.id ?? null,
          last_error: null,
          attempts: (job.attempts || 0) + 1
        }).eq('id', job.id);

        // NTFY
        await fetch(`https://ntfy.sh/${topic}`, {
          method: 'POST',
          body: `📩 ${job.template} enviado a ${to}`,
          headers: { Title: "Correo enviado", Tags: "email" }
        });

      } catch (err) {
        const attempts = (job.attempts || 0) + 1;

        await supabase.from('outbox_emails').update({
          status: attempts >= 5 ? 'failed' : 'queued',
          attempts,
          last_error: err?.message ?? String(err)
        }).eq('id', job.id);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });

  } catch (e) {
    console.error(`[${BUILD}] FATAL:`, e);
    return new Response(JSON.stringify({ error: e.message }), {
      headers: corsHeaders,
      status: 500
    });
  }
});
