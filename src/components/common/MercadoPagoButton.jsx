// src/components/common/MercadoPagoButton.jsx
import React, { useState } from "react";
import { Loader2 } from "lucide-react";

export default function MercadoPagoButton({
  product,                // { title, quantity, unit_price, currency_id }
  label = "Pagar",
  className = "",
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const functionsUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co`;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handlePay = async () => {
    try {
      setBusy(true);
      setErr("");

      const resp = await fetch(`${functionsUrl}/mp-generate-preference-v2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({ items: [product] }),
      });

      const data = await resp.json();
      if (!resp.ok || !data?.initPoint || !data?.sessionId) {
        throw new Error(data?.error || "No se pudo crear el pago.");
      }

      // Guardamos por si luego quieres usarlo (p. ej. en /gracias-kit)
      localStorage.setItem("rm_mp_session", data.sessionId);

      // Abrimos Checkout Pro en ESTA misma pestaña
      window.location.assign(data.initPoint);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error iniciando el pago.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <button
        onClick={handlePay}
        disabled={busy}
        className="w-full h-11 rounded-lg bg-teal-500 hover:bg-teal-400 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Abriendo pago…
          </span>
        ) : (
          label
        )}
      </button>
      {err && <p className="mt-2 text-center text-sm text-red-400">{err}</p>}
    </div>
  );
}
