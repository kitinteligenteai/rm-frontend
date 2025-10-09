import React, { useState } from "react";

/**
 * Botón de pago para Mercado Pago
 * - Llama a la Edge Function pública mp-generate-preference-v2
 * - Si recibe initPoint/preferenceId, redirige al checkout
 * - Muestra errores reales en pantalla y en consola
 *
 * Si necesitas cambiar precio/moneda dinámicamente,
 * edita el objeto "payload" dentro de handleClick().
 */
export default function MercadoPagoButton() {
  const [loading, setLoading] = useState(false);

  // Endpoint público (sin JWT) — usa tu PROJECT_REF real
  const API =
    "https://mgjzlohapnepvrqlxmpo.functions.supabase.co/mp-generate-preference-v2";

  const handleClick = async () => {
    try {
      setLoading(true);

      // 👇 Ajusta aquí si quieres otro precio/moneda/título
      const payload = {
        items: [
          {
            title: "Kit de 7 Días - Reinicio Metabólico",
            quantity: 1,
            unit_price: 139,
            currency_id: "MXN",
          },
        ],
      };

      const resp = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await resp.json();
      } catch (_) {
        // Si la respuesta no es JSON válido
        throw new Error(`Respuesta no JSON (HTTP ${resp.status})`);
      }

      if (!resp.ok) {
        // Muestra error real que viene del backend si lo hay
        const msg =
          (data && (data.error || data.message)) ||
          `HTTP ${resp.status} al crear preferencia`;
        throw new Error(msg);
      }

      // Usar initPoint si viene; si no, construir con preferenceId
      const url =
        data.initPoint ||
        (data.preferenceId
          ? `https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=${data.preferenceId}`
          : null);

      if (!url) {
        throw new Error(
          "La función no devolvió initPoint ni preferenceId válidos."
        );
      }

      // Redirigir
      window.location.href = url;
    } catch (err) {
      console.error("[MP Button] Error:", err);
      alert(`[MP Button] Error: ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full bg-[#FFEA00] text-black font-bold py-3 px-4 rounded-lg shadow-lg hover:brightness-95 disabled:opacity-60"
      aria-busy={loading ? "true" : "false"}
    >
      {loading ? "Preparando pago..." : "Pagar con Mercado Pago"}
    </button>
  );
}
