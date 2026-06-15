// supabase/functions/email-worker-v2/index.ts

// BUILD: 2026-06-15 — v10.6-FINAL-KIT-LINK-HOME
// Incluye: Magic Links + Auto-Creación de Usuario + Entrega Kit vía PDF maestro web

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// =======================================================
//  CONFIGURACIÓN
// =======================================================

const KIT_DOWNLOAD_URL = 'https://www.reiniciometabolico.net/kits/kit-7-dias.pdf';
const SUPPORT_EMAIL = 'soporte@reiniciometabolico.net';

// =======================================================
//  PLANTILLAS
// =======================================================

// 1. Plantilla KIT (Descarga directa, sin login)
const templateWelcomeKit = () => ({
  subject: 'Tu acceso al Kit de 7 días – Reinicio Metabólico',
  html: `<!DOCTYPE html>
<html>
  <body style="font-family:Arial, sans-serif;color:#333;line-height:1.5;">
    <h2>¡Bienvenido a Reinicio Metabólico!</h2>

    <p>Tu <strong>Kit de 7 días</strong> está listo.</p>

    <p>
      Descarga tu guía desde el siguiente botón:
    </p>

    <p>
      <a href="${KIT_DOWNLOAD_URL}"
         style="background:#00838f;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">
         📥 Descargar Kit
      </a>
    </p>

    <p style="font-size:13px;color:#555;">
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
      <a href="${KIT_DOWNLOAD_URL}" style="color:#00838f;">${KIT_DOWNLOAD_URL}</a>
    </p>

    <p>Soporte: ${SUPPORT_EMAIL}</p>
  </body>
</html>`,
  text: `Tu Kit de 7 días está listo.

Descarga tu Kit aquí:
${KIT_DOWNLOAD_URL}

Soporte:
${SUPPORT_EMAIL}`
});

// 2. Plantilla PROGRAMA (Con Magic Link para crear contraseña)
const templateWelcomeProgram = (magicLink) => ({
  subject: 'Acceso al Programa Completo – Reinicio Metabólico',
  html: `<!DOCTYPE html>
<html>
  <body style="font-family:Arial, sans-serif; color:#333; line-height:1.6;">
    <h2>¡Bienvenido al Programa Completo!</h2>

    <p>Tu cuenta ha sido creada y tu acceso está listo.</p>

    <p>
      Haz clic abajo para <strong>configurar tu contraseña segura</strong>
      y entrar a la plataforma:
    </p>

    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <a href="${magicLink}"
             style="background-color:#0066cc; color:#ffffff; padding:15px 25px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:16px; display:inline-block;">
             🔐 Activar Cuenta y Crear Contraseña
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size:12px; color:#666;">Enlace seguro único: ${magicLink}</p>

    <p>¡Vamos con todo!<br>Equipo Reinicio Metabólico</p>
  </body>
</html>`,
  text: `Bienvenido al Programa Completo.

Activa tu cuenta aquí:
${magicLink}

Equipo Reinicio Metabólico`
});

Deno.serve(async () => {
  try {
    // Usamos SERVICE_ROLE para permisos administrativos
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const topic = Deno.env.get('NTFY_TOPIC') || 'reiniciometabolico';

    // 1. Leer trabajos pendientes
    const { data: jobs, error: qErr } = await supabase
      .from('outbox_emails')
      .select('*')
      .eq('status', 'queued')
      .limit(5);

    if (qErr) throw qErr;

    if (!jobs?.length) {
      return new Response(JSON.stringify({ ok: true, processed: 0 }), {
        headers: corsHeaders
      });
    }

    // 2. Procesar trabajos
    for (const job of jobs) {
      let to = job.to_email;

      try {
        // Recuperación de email de respaldo si viene vacío o es testuser
        if ((!to || to.includes('@testuser')) && job.payload?.session_id) {
          const { data: s } = await supabase
            .from('checkout_sessions')
            .select('email_final')
            .eq('id', job.payload.session_id)
            .single();

          if (s?.email_final) to = s.email_final;
        }

        if (!to || !to.includes('@')) {
          throw new Error('Email inválido');
        }

        let emailContent;
        let productLabel = 'PRODUCTO';

        // --- LÓGICA DE PROGRAMA (MAGIC LINK + AUTO-CREATE USER) ---
        if (job.template === 'welcome-program') {
          productLabel = '🚀 PROGRAMA ($1299)';

          // A. Intento de crear usuario si no existe
          const { error: createErr } = await supabase.auth.admin.createUser({
            email: to,
            email_confirm: true,
            user_metadata: { full_name: 'Miembro Fundador' }
          });

          // Si falla porque ya existe, lo ignoramos y seguimos
          if (createErr && !createErr.message.includes('already registered')) {
            console.warn('Aviso al crear usuario:', createErr.message);
          }

          // B. Generar link de recuperación para que configure contraseña
          const { data: linkData, error: linkError } =
            await supabase.auth.admin.generateLink({
              type: 'recovery',
              email: to,
              options: {
                redirectTo: 'https://reiniciometabolico.net/reset-password'
              }
            });

          if (linkError) throw linkError;

          emailContent = templateWelcomeProgram(linkData.properties.action_link);
        } else {
          // --- LÓGICA DE KIT (DESCARGA DIRECTA) ---
          productLabel = '📘 KIT ($139)';
          emailContent = templateWelcomeKit();
        }

        // --- ENVIAR CORREO (Resend) ---
        const { error: sendErr } = await resend.emails.send({
          from: 'Reinicio Metabólico <acceso@reiniciometabolico.net>',
          to: to,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });

        if (sendErr) throw sendErr;

        // --- ACTUALIZAR DB ---
        await supabase
          .from('outbox_emails')
          .update({
            status: 'sent',
            last_error: null
          })
          .eq('id', job.id);

        // --- NOTIFICACIÓN DE ÉXITO (NTFY) ---
        await fetch(`https://ntfy.sh/${topic}`, {
          method: 'POST',
          body: `✅ ENTREGADO: ${productLabel}\nCliente: ${to}`,
          headers: {
            Title: 'Envío Exitoso',
            Tags: 'email,white_check_mark'
          }
        });
      } catch (err) {
        console.error(`Error job ${job.id}:`, err);

        await supabase
          .from('outbox_emails')
          .update({
            status: 'failed',
            last_error: err.message,
            attempts: (job.attempts || 0) + 1
          })
          .eq('id', job.id);

        await fetch(`https://ntfy.sh/${topic}`, {
          method: 'POST',
          body: `🚫 Error enviando a ${to}\nCausa: ${err.message}`,
          headers: {
            Title: 'Fallo de Envío',
            Tags: 'warning,no_entry_sign',
            Priority: 'high'
          }
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: jobs.length }), {
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      headers: corsHeaders,
      status: 500
    });
  }
});