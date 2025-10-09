import React, { useState, useRef } from "react";

export default function MercadoPagoButton() {
  const [loading, setLoading] = useState(false);
  const clickedRef = useRef(false);
  const API = "https://mgjzlohapnepvrqlxmpo.functions.supabase.co/mp-generate-preference-v2";

  const handleClick = async () => {
    if (clickedRef.current) return; // evita doble click rápido
    clickedRef.current = true;
    setLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000); // 10s timeout “duro”

    try {
      const payload = {
        items: [{ title: "Kit de 7 Días - Reinicio Metabólico", quantity: 1, unit_price: 139, currency_id: "MXN" }],
      };

      const resp = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || `HTTP ${resp.status}`);

      const url =
        data.initPoint ||
        (data.preferenceId
          ? `https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=${data.preferenceId}`
          : null);

      if (!url) throw new Error("No llegó initPoint ni preferenceId.");

      // Redirige en la MISMA pestaña (lo más compatible con bloqueadores)
      window.location.assign(url);
    } catch (err) {
      console.error("[MP Button] Error:", err);
      alert(`[MP Button] Error: ${err?.message || String(err)}`);
      clickedRef.current = false; // permitir reintento
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full bg-[#FFEA00] text-black font-bold py-3 px-4 rounded-lg shadow-lg hover:brightness-95 disabled:opacity-60 flex items-center justify-center gap-2"
      aria-busy={loading ? "true" : "false"}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
          <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" fill="none" />
        </svg>
      )}
      {loading ? "Preparando pago..." : "Pagar con Mercado Pago"}
    </button>
  );
}
