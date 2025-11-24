// =======================================================
// email-worker-v2 — versión PRO con soporte para plantillas externas
// BUILD: 2025-11-21 — v9.0-PRODUCTION
// =======================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@3.2.0";

const BUILD = "email-worker-v2@2025-11-21-v9.0-PRO";

// --------------------------------------
// CORS
// --------------------------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// --------------------------------------
// PLANTILLAS PERMITIDAS (IDs Reales de Resend)
// --------------------------------------
// NOTA: Estas deben ser exactamente los IDs de plantillas en Resend
const ALLOWED_TEMPLATES = [
  "welcome-kit-7-dias",
  "welcome-program",
];

// --------------------------------------
// MAIN WORKER LOOP
// --------------------------------------
Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("Falta RESEND_API_KEY.");

    const resend = new Resend(resendKey);

    const topic = Deno.env.get("NTFY_TOPIC") || "reiniciometabolico";

    // ===================================================
    // 1. Leer trabajos pendientes de outbox
    // ===================================================
    const { data: jobs, error: qErr } = await supabase
      .from("outbox_emails")
      .select(
        "id, to_email, template, payload, attempts, status, created_at"
      )
      .eq("status", "queued")
      .gte(
        "created_at",
        new Date(Date.now() - 1000 * 60 * 60).toISOString()
      ) // últimos 60 min
      .order("created_at", { ascending: true })
      .limit(20);

    if (qErr) throw qErr;

    if (!jobs?.length) {
      console.log(`[${BUILD}] No pending emails.`);
      return new Response(JSON.stringify({ ok: true }), {
        headers: corsHeaders,
      });
    }

    console.log(`[${BUILD}] Procesando ${jobs.length} correos…`);

    // ===================================================
    // 2. Procesar cada correo en cola
    // ===================================================
    for (const job of jobs) {
      try {
        // Saltar si ya está marcado como enviado
        if (job.status === "sent") continue;

        // ----------------------------------------------
        // Validar plantilla
        // ----------------------------------------------
        const tpl = job.template?.trim();
        if (!tpl || !ALLOWED_TEMPLATES.includes(tpl)) {
          console.log(`❌ Plantilla inválida: ${tpl}`);

          await supabase
            .from("outbox_emails")
            .update({
              status: "failed",
              last_error: `Plantilla no permitida: ${tpl}`,
            })
            .eq("id", job.id);

          continue;
        }

        // ----------------------------------------------
        // Resolver email destino
        // ----------------------------------------------
        let to = (job.to_email || "").trim().toLowerCase();

        if (!to || to.endsWith("@testuser.com")) {
          const sid = job.payload?.session_id;

          if (!sid) {
            await supabase
              .from("outbox_emails")
              .update({
                attempts: (job.attempts || 0) + 1,
                last_error: "No session_id para resolver email destino",
              })
              .eq("id", job.id);
            continue;
          }

          const { data: session } = await supabase
            .from("checkout_sessions")
            .select("email_final")
            .eq("id", sid)
            .single();

          if (!session?.email_final) {
            await supabase
              .from("outbox_emails")
              .update({
                attempts: (job.attempts || 0) + 1,
                last_error: "email_final no disponible",
              })
              .eq("id", job.id);
            continue;
          }

          to = session.email_final.toLowerCase();
          await supabase
            .from("outbox_emails")
            .update({ to_email: to })
            .eq("id", job.id);
        }

        console.log(`📧 Enviando ${tpl} → ${to}`);

        // ----------------------------------------------
        // 3. ENVIAR CORREO CON TEMPLATE REAL DE RESEND
        // ----------------------------------------------
        const { data: sent, error: sendErr } = await resend.emails.send({
          from: "Reinicio Metabólico <acceso@reiniciometabolico.net>",
          to,
          template: tpl, // ⭐⭐ LA LÍNEA CLAVE ⭐⭐
          reply_to: "soporte@reiniciometabolico.net",
        });

        if (sendErr) throw sendErr;

        // ----------------------------------------------
        // 4. Marcar como enviado
        // ----------------------------------------------
        await supabase
          .from("outbox_emails")
          .update({
            status: "sent",
            provider_message_id: sent?.id ?? null,
            attempts: (job.attempts || 0) + 1,
            last_error: null,
          })
          .eq("id", job.id);

        // ----------------------------------------------
        // 5. Notificación NTFY → una sola por correo
        // ----------------------------------------------
        await fetch(`https://ntfy.sh/${topic}`, {
          method: "POST",
          body: `📩 Correo enviado: ${tpl} → ${to}`,
          headers: { Title: "Correo enviado", Tags: "email" },
        });
      } catch (err) {
        const attempts = (job.attempts || 0) + 1;

        await supabase
          .from("outbox_emails")
          .update({
            status: attempts >= 5 ? "failed" : "queued",
            attempts,
            last_error: err?.message ?? String(err),
          })
          .eq("id", job.id);

        console.error(`❌ Error en job ${job.id}:`, err);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: corsHeaders,
    });
  } catch (err) {
    console.error(`[${BUILD}] FATAL:`, err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
