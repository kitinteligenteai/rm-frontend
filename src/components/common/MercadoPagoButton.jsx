// src/components/common/MercadoPagoButton.jsx
// v3.1 — Consentimiento legal + payload sin precio

import React, { useState, useRef } from "react";

export default function MercadoPagoButton({
  label = "Pagar con Mercado Pago",
  productId = "kit-7-dias",
  legalConsent = null,
}) {
  const [loading, setLoading] = useState(false);
  const clickedRef = useRef(false);

  const API = "https://mgjzlohapnepvrqlxmpo.functions.supabase.co/mp-generate-preference-v2";

  const handleClick = async () => {
    if (!legalConsent?.accepted) {
      alert("Para continuar, acepta los términos, el aviso de privacidad y la política de devoluciones.");
      return;
    }

    if (clickedRef.current) return;
    clickedRef.current = true;
    setLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const payload = {
        productId,
        legalConsent: {
          accepted: true,
          termsVersion: legalConsent.termsVersion,
          privacyVersion: legalConsent.privacyVersion,
          refundsVersion: legalConsent.refundsVersion,
          consentedAt: legalConsent.consentedAt || new Date().toISOString(),
        },
      };

      const resp = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || `Error del servidor (${resp.status})`);

      const url =
        data.initPoint ||
        (data.preferenceId
          ? `https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=${data.preferenceId}`
          : null);

      if (!url) throw new Error("No se recibió link de pago. Intenta de nuevo.");

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
        <span>{label}</span>
      )}
    </button>
  );
}