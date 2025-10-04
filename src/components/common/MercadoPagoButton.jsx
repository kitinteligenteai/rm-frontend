// src/components/common/MercadoPagoButton.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, RefreshCw } from "lucide-react";

export default function MercadoPagoButton({
  placeholderText = "Pagar con Mercado Pago",
  helperText = "Pago seguro • Confirmación inmediata",
  theme = "dark",
  className = "",
}) {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const containerRef = useRef(null);
  const scriptRef = useRef(null);

  const functionsUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co`;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const cleanupScript = ( ) => {
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }
    if (containerRef.current) containerRef.current.innerHTML = "";
  };

  const injectScript = (preferenceId) => {
    cleanupScript();
    const script = document.createElement("script");
    script.src = "https://www.mercadopago.com.mx/integrations/v1/web-payment-checkout.js";
    script.setAttribute("data-preference-id", preferenceId );
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () => setErr("No se pudo cargar el botón de Mercado Pago.");
    scriptRef.current = script;
    containerRef.current?.appendChild(script);
  };

  const init = useCallback(async () => {
    try {
      setBusy(true);
      setErr("");
      setReady(false);

      const resp = await fetch(`${functionsUrl}/mp-generate-preference-v2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({}),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.preferenceId) {
        throw new Error(data?.error || "No se pudo crear la preferencia.");
      }

      injectScript(data.preferenceId);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error inicializando el checkout.");
    } finally {
      setBusy(false);
    }
  }, [anonKey, functionsUrl]);

  useEffect(() => {
    init();
    return cleanupScript;
  }, [init]);

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative w-full h-[52px] rounded-lg border ${
          theme === "dark" ? "border-gray-700 bg-gray-800/60" : "border-gray-200 bg-gray-50"
        } ${ready ? "opacity-0 pointer-events-none absolute -z-10" : "opacity-100"}`}
      >
        <div className="h-full w-full flex items-center justify-center gap-2 text-sm">
          {busy ? (
            <><Loader2 className="h-4 w-4 animate-spin" /><span>Cargando botón de pago…</span></>
          ) : err ? (
            <div className="flex items-center gap-2">
              <span className="text-red-400">{err}</span>
              <button type="button" onClick={init} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-600 hover:bg-gray-800">
                <RefreshCw className="h-3.5 w-3.5" />Reintentar
              </button>
            </div>
          ) : (
            <><Loader2 className="h-4 w-4 animate-spin" /><span>{placeholderText}</span></>
          )}
        </div>
      </div>
      <div ref={containerRef} className={`${ready ? "opacity-100" : "opacity-0"} transition-opacity duration-150`} aria-live="polite" />
      <p className="mt-2 text-center text-[11px] text-gray-500">{helperText}</p>
    </div>
  );
}
