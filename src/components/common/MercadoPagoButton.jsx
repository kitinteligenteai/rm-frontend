// src/components/common/MercadoPagoButton.jsx (v3.0 Blindado)
// Ya no envía precios. Solo envía productId.

import React, { useState, useRef } from "react";

/**
 * Props esperadas:
 * - label: Texto del botón
 * - productId: ID del producto ("kit-7-dias" o "programa-completo")
 */
export default function MercadoPagoButton({ label = "Pagar con Mercado Pago", productId = "kit-7-dias" }) {
  const [loading, setLoading] = useState(false);
  const clickedRef = useRef(false);
  
  // ⚠️ Asegúrate de que este projectRef sea el tuyo (mgjzlohapnepvrqlxmpo)
  const API = "https://mgjzlohapnepvrqlxmpo.functions.supabase.co/mp-generate-preference-v2";

  const handleClick = async () => {
    if (clickedRef.current) return;
    clickedRef.current = true;
    setLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000); // 15 seg timeout

    try {
      // 🔒 PAYLOAD SEGURO: Solo enviamos QUÉ queremos comprar, no cuánto cuesta.
      const payload = { productId };
      
      const resp = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || `Error del servidor (${resp.status})`);

      // Lógica de redirección a Mercado Pago
      const url =
        data.initPoint ||
        (data.preferenceId
          ? `https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=${data.preferenceId}`
          : null);

      if (!url) throw new Error("No se recibió link de pago. Intenta de nuevo.");
      
      // Redirigir al usuario
      window.location.assign(url);

    } catch (err) {
      console.error("[MP Button] Error:", err);
      alert(`No se pudo iniciar el pago: ${err.message}`);
      clickedRef.current = false;
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
      className="w-full bg-[#009EE3] hover:bg-[#0081B9] text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      aria-busy={loading ? "true" : "false"}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
            <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" fill="none" />
          </svg>
          <span>Procesando...</span>
        </>
      ) : (
        <>
          {/* Logo simple de MP opcional o solo texto */}
          <span>{label}</span>
        </>
      )}
    </button>
  );
}