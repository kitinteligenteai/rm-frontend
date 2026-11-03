// src/components/common/MercadoPagoButton.jsx
// v3.1 — Consentimiento legal + payload sin precio

import React, { useState, useRef, useId } from "react";

export default function MercadoPagoButton({
  label = "Pagar con Mercado Pago",
  productId = "kit-7-dias",
  legalConsent = null,
}) {
  const formId = useId();
  const [email, setEmail] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const clickedRef = useRef(false);

  const API = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mp-generate-preference-v2`;

  const handleClick = async (event) => {
    event.preventDefault();
    setError("");
    if (email.trim().toLowerCase() !== confirmation.trim().toLowerCase()) {
      setError("Los correos deben coincidir. Revísalos antes de pagar.");
      return;
    }
    if (!legalConsent?.accepted) {
      setError(
        "Acepta los términos, privacidad y devoluciones antes de continuar.",
      );
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
        email: email.trim().toLowerCase(),
        emailConfirmation: confirmation.trim().toLowerCase(),
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
      if (!resp.ok)
        throw new Error(data?.error || `Error del servidor (${resp.status})`);

      const url =
        data.initPoint ||
        (data.preferenceId
          ? `https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=${data.preferenceId}`
          : null);

      if (data.sessionId && data.checkoutToken) {
        try {
          localStorage.setItem(
            `rm:checkout:${data.sessionId}`,
            data.checkoutToken,
          );
          localStorage.setItem(
            `rm:checkout-email:${data.sessionId}`,
            email.trim().toLowerCase(),
          );
        } catch {
          /* Delivery is bound to the server-side email before redirect. */
        }
      } else throw new Error("No se recibió una sesión segura de compra.");
      if (!url)
        throw new Error("No se recibió link de pago. Intenta de nuevo.");

      window.location.assign(url);
    } catch (err) {
      console.error("[MP Button] Error:", err);
      setError(
        "No se pudo iniciar el pago. Revisa tu conexión e inténtalo de nuevo.",
      );
      clickedRef.current = false;
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleClick} className="space-y-3">
      <label
        htmlFor={formId + "-email"}
        className="block text-sm text-slate-200"
      >
        Correo para recibir tu producto
      </label>
      <input
        id={formId + "-email"}
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        maxLength={254}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg bg-slate-800 border border-slate-600 p-3 text-white text-base"
      />
      <label
        htmlFor={formId + "-confirm"}
        className="block text-sm text-slate-200"
      >
        Confirma tu correo
      </label>
      <input
        id={formId + "-confirm"}
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        maxLength={254}
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        className="w-full rounded-lg bg-slate-800 border border-slate-600 p-3 text-white text-base"
      />
      <p className="text-xs text-slate-400">
        Si el pago se aprueba, recibirás el producto en este correo, aunque
        regreses desde otra aplicación. Revísalo antes de continuar.
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-200">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#009EE3] hover:bg-[#0081B9] text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        aria-busy={loading ? "true" : "false"}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                opacity="0.3"
              />
              <path
                d="M4 12a8 8 0 0 1 8-8"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
            </svg>
            <span>Procesando...</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </button>
    </form>
  );
}
