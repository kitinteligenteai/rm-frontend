// supabase/functions/mp-webhook/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req ) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const dataId = url.searchParams.get("data.id");

    if (type !== "payment" || !dataId) {
      return new Response("OK (Not a payment event)", { status: 200, headers: corsHeaders });
    }

    const MP_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE");

    if (!MP_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      throw new Error("Faltan secretos del servidor para el webhook.");
    }

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: { "Authorization": `Bearer ${MP_ACCESS_TOKEN}` }
    } );

    const payment = await paymentResponse.json();

    if (payment.status !== "approved") {
      return new Response("OK (Payment not approved)", { status: 200, headers: corsHeaders });
    }

    const email = payment?.payer?.email?.toLowerCase().trim();
    const productId = "kit-reinicio-01";

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    const { error: purchaseError } = await adminClient.from("purchases").insert({
      provider: "mercadopago",
      provider_payment_id: String(payment.id),
      email: email,
      product_id: productId,
      status: payment.status,
      meta: payment
    });

    if (purchaseError && purchaseError.code !== '23505') { // 23505 es error de duplicado, lo ignoramos
      throw purchaseError;
    }

    if (email) {
      const { error: entitlementError } = await adminClient.from("entitlements").upsert(
        { email: email, product_id: productId, status: 'active' },
        { onConflict: 'email,product_id' }
      );
      if (entitlementError) throw entitlementError;
    }

    return new Response("Webhook processed successfully", { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error("Error en el webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
