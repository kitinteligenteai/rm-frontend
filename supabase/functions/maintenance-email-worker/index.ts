// supabase/functions/maintenance-email-worker/index.ts
// Mantenimiento mensual del Email Worker — Reinicio Metabólico
// BUILD: 2025-10-15 — versión estable
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
const BUILD = "maintenance-email-worker@2025-10-15";
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: corsHeaders
  });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    console.log(`[${BUILD}] Inicio de limpieza mensual`);
    // 1️⃣ Eliminar correos de prueba de Mercado Pago
    await supabase.from("outbox_emails").delete().or("to_email.ilike.%@testuser.com%, to_email.is.null");
    // 2️⃣ Reiniciar intentos en correos atascados
    await supabase.from("outbox_emails").update({
      attempts: 0,
      last_error: null,
      updated_at: new Date().toISOString()
    }).eq("status", "queued").gt("attempts", 50);
    // 3️⃣ Eliminar correos fallidos de más de 30 días
    await supabase.rpc("exec_sql", {
      sql: `
        delete from outbox_emails
        where status = 'failed'
        and created_at < now() - interval '30 days';
      `
    });
    // 4️⃣ Confirmación
    const { data: resumen } = await supabase.from("outbox_emails").select(`
      count(*) filter (where status='queued') as queued,
      count(*) filter (where status='sent') as sent,
      count(*) filter (where status='failed') as failed
    `);
    console.log(`[${BUILD}] Limpieza completada`, resumen);
    return new Response(JSON.stringify({
      ok: true,
      build: BUILD,
      resumen
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error(`[${BUILD}] Error:`, err);
    return new Response(JSON.stringify({
      ok: false,
      error: err.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
