// supabase/functions/mp-generate-preference/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // O puedes poner tu dominio: Deno.env.get("APP_URL" )
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    const APP_URL = Deno.env.get("APP_URL");
    const WEBHOOK_URL = Deno.env.get("WEBHOOK_URL");

    if (!MP_ACCESS_TOKEN || !APP_URL || !WEBHOOK_URL) {
      throw new Error("Faltan secretos del servidor: MERCADOPAGO_ACCESS_TOKEN, APP_URL o WEBHOOK_URL");
    }

    const { user } = await req.json().catch(() => ({ user: null }));

    const preferenceBody = {
      items: [
        {
          id: "kit-reinicio-01",
          title: "Kit de Inicio Reinicio Metabólico",
          quantity: 1,
          unit_price: 7.00,
          currency_id: "USD",
        }
      ],
      back_urls: {
        success: `${APP_URL}/gracias-kit`,
        failure: `${APP_URL}/pago-fallido`,
        pending: `${APP_URL}/pago-pendiente`,
      },
      auto_return: "approved",
      notification_url: WEBHOOK_URL,
      external_reference: user?.id || null,
      payer: user?.email ? { email: user.email } : undefined,
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(preferenceBody )
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Error de Mercado Pago:", data);
      throw new Error("Error al crear la preferencia de pago en Mercado Pago.");
    }

    return new Response(
      JSON.stringify({ id: data.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
