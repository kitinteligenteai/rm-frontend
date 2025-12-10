// supabase/functions/email-worker-v2/index.ts
// BUILD: 2025-12-10 — v10.5-FINAL-AUTO-USER
// Incluye: Magic Links + Auto-Creación de Usuario (Fix User not found) + Notificaciones Claras

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// =======================================================
//  PLANTILLAS
// =======================================================

// 1. Plantilla KIT (Descarga directa, sin login)
const templateWelcomeKit = () => ({
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
    <p>Soporte: soporte@reiniciometabolico.net</p>
  </body></html>`,
  text: `Descarga tu Kit aquí: https://mgjzlohapnepvrqlxmpo.supabase.co/storage/v1/object/public/productos-digitales/Tu_Plan_de_7_Dias_Reinicio_Metabolico.pdf`
});

// 2. Plantilla PROGRAMA (Con Magic Link para crear contraseña)
const templateWelcomeProgram = (magicLink) => ({
  subject: 'Acceso al Programa Completo – Reinicio Metabólico',
  html: `<!DOCTYPE html><html><body style="font-family:Arial, sans-serif; color:#333; line-height:1.6;">
    <h2>¡Bienvenido al Programa Completo!</h2>
    <p>Tu cuenta ha sido creada y tu acceso está listo.</p>
    <p>Haz clic abajo para <strong>configurar tu contraseña segura</strong> y entrar a la plataforma:</p>
    
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
  </body></html>`,
  text: `Bienvenido al Programa Completo.\n\nActiva tu cuenta aquí:\n${magicLink}\n\nEquipo Reinicio Metabólico`
});

Deno.serve(async () => {
  try {
    // Usamos SERVICE_ROLE para permisos administrativos (crear usuarios y generar links)
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
    if (!jobs?.length) return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });

    // 2. Procesar trabajos
    for (const job of jobs) {
      let to = job.to_email;
      try {
        // Recuperación de email de respaldo (si viene vacío o es testuser)
        if ((!to || to.includes('@testuser')) && job.payload?.session_id) {
            const { data: s } = await supabase.from('checkout_sessions').select('email_final').eq('id', job.payload.session_id).single();
            if (s?.email_final) to = s.email_final;
        }

        if (!to || !to.includes('@')) throw new Error("Email inválido");

        let emailContent;
        let productLabel = "PRODUCTO";

        // --- LÓGICA DE PROGRAMA (MAGIC LINK + AUTO-CREATE USER) ---
        if (job.template === 'welcome-program') {
            productLabel = "🚀 PROGRAMA ($1299)";
            
            // A. INTENTO DE CREAR USUARIO (Si no existe)
            // Esto es lo que faltaba: Creamos el usuario en Auth para que no falle el link
            const { error: createErr } = await supabase.auth.admin.createUser({
                email: to,
                email_confirm: true, // Confirmamos directo porque ya pagó
                user_metadata: { full_name: "Miembro Fundador" }
            });

            // Si falla porque ya existe, lo ignoramos y seguimos (es normal)
            if (createErr && !createErr.message.includes('already registered')) {
                console.warn("Aviso al crear usuario:", createErr.message);
            }

            // B. GENERAR LINK DE RECUPERACIÓN (Magic Link)
            // Esto permite que el usuario ponga su contraseña sin saber la anterior
            const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
                type: 'recovery',
                email: to,
                options: { redirectTo: 'https://reiniciometabolico.net/reset-password' }
            });

            if (linkError) throw linkError;
            
            // Usamos el link generado
            emailContent = templateWelcomeProgram(linkData.properties.action_link);

        } else {
            // --- LÓGICA DE KIT (SIMPLE) ---
            productLabel = "📘 KIT ($139)";
            emailContent = templateWelcomeKit();
        }

        // --- ENVIAR CORREO (Resend) ---
        const { data: sent, error: sendErr } = await resend.emails.send({
          from: 'Reinicio Metabólico <acceso@reiniciometabolico.net>',
          to: to,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });

        if (sendErr) throw sendErr;

        // --- ACTUALIZAR DB ---
        await supabase.from('outbox_emails').update({ status: 'sent', last_error: null }).eq('id', job.id);

        // --- NOTIFICACIÓN DE ÉXITO (NTFY) ---
        // Te avisa qué producto se entregó
        await fetch(`https://ntfy.sh/${topic}`, {
          method: 'POST',
          body: `✅ ENTREGADO: ${productLabel}\nCliente: ${to}`,
          headers: { Title: "Envío Exitoso", Tags: "email,white_check_mark" }
        });

      } catch (err) {
        console.error(`Error job ${job.id}:`, err);
        await supabase.from('outbox_emails').update({ 
            status: 'failed', 
            last_error: err.message, 
            attempts: (job.attempts || 0) + 1 
        }).eq('id', job.id);

        // NOTIFICACIÓN DE FALLO
        await fetch(`https://ntfy.sh/${topic}`, {
            method: 'POST',
            body: `🚫 Error enviando a ${to}\nCausa: ${err.message}`,
            headers: { Title: "Fallo de Envío", Tags: "warning,no_entry_sign", Priority: "high" }
        });
      }
    }

    return new Response(JSON.stringify({ processed: jobs.length }), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { headers: corsHeaders, status: 500 });
  }
});