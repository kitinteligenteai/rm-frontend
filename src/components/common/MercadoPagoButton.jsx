// RUTA: src/components/common/MercadoPagoButton.jsx
import React, { useMemo, useState } from "react";

/**
 * Botón "amarillo Mercado Pago" (simulado) que:
 * 1) Llama a la Edge Function mp-generate-preference-v2 con items dinámicos
 * 2) Redirige al checkout hosted de MP
 *
 * Props:
 * - items: [{ title, quantity, unit_price, currency_id }]
 * - label: string
 * - disabled: boolean
 * - size: "compact" | "normal"
 * - onError: (msg) => void
 */
export default function MercadoPagoButton({
  items = [],
  label = "Pagar con Mercado Pago",
  disabled = false,
  size = "compact",
  onError,
}) {
  const [loading, setLoading] = useState(false);

  // Base público de Edge Functions
  const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_REF;
  const FN_BASE = useMemo(() => {
    if (projectRef) return `https://${projectRef}.functions.supabase.co`;
    const supaUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, "");
    return `${supaUrl}/functions/v1`;
  }, [projectRef]);

  async function handleClick() {
    if (disabled || loading) return;
    try {
      setLoading(true);

      const res = await fetch(`${FN_BASE}/mp-generate-preference-v2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      if (!res.ok || !data?.preferenceId) {
        throw new Error(data?.error || "No se pudo iniciar el pago.");
      }

      // Redirección a checkout hosted de Mercado Pago
      window.location.href = `https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=${data.preferenceId}`;
    } catch (e) {
      console.error("[MP Button]", e);
      onError?.(e?.message || "Error al iniciar el pago.");
    } finally {
      setLoading(false);
    }
  }

  // Estética "Mercado Pago" (amarillo)
  const base =
    "w-full inline-flex items-center justify-center rounded-xl shadow-sm " +
    "transition-colors duration-150 focus:outline-none focus:ring-2 " +
    "focus:ring-offset-2 focus:ring-[#ffe600]/60 text-slate-900 select-none";
  const sizeCls = size === "compact" ? "h-11 text-[15px]" : "h-12 text-[16px]";
  const color =
    disabled || loading
      ? "bg-[#ffe600]/70 cursor-not-allowed"
      : "bg-[#ffe600] hover:bg-[#ffd800] active:bg-[#ffcf00]";
  const weight = "font-semibold";
  const gap = "gap-2";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading ? "true" : "false"}
      className={`${base} ${sizeCls} ${weight} ${color} ${gap}`}
    >
      {/* Ícono genérico de “pago” */}
      <svg
        aria-hidden="true"
        className="h-[18px] w-[18px]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M3 7a2 2 0 012-2h7.5a2 2 0 012 2v1H21a1 1 0 011 1v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-1H4a1 1 0 01-1-1V7zM6 9v8a1 1 0 001 1h12a1 1 0 001-1v-7H6zm5 5a1 1 0 100 2h4a1 1 0 100-2h-4z" />
      </svg>
      <span className="leading-none">
        {loading ? "Preparando pago…" : label}
      </span>
    </button>
  );
}
